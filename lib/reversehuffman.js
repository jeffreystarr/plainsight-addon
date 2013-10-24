/**
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
 * distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * reversehuffman.js
 *
 * Implements the 'Reverse-Huffman encoding' steganographic algorithm as described in
 * _Disappearing Cryptography: Information Hiding: Steganography & Watermarking_, 3rd
 * Edition, by Peter Wayner.
 */

var arith = require("./arith");
var textutils = require("./textutils");

/**
 * beginsWith has the same sort of semantics as startsWith. However, startsWith is an "experimental"
 * function and not included in many JavaScript interpreters (e.g. Chrome V8). Furthermore, startsWith
 * is implemented as String.indexOf == 0, which makes it a fairly expensive operation versus the
 * version below.
 */
if (!String.prototype.beginsWith) {
    Object.defineProperty(String.prototype, 'beginsWith', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (prefix) {
            "use strict";
            if(this.length < prefix.length) {
                return false;
            } else {
                for(let i = 0; i < prefix.length; i++) {
                    if(this.charAt(i) != prefix.charAt(i)) {
                        return false;
                    }
                }
                return true;
            }
        }
    });
}

/**
 * Using the keyvalue frequency table, decrypt the ciphertext and return a plain text string
 * @param ciphertext
 * @param keyvalue
 */
var decrypt = function (ciphertext, keyvalue) {
    "use strict";

    if(ciphertext.length === 0) {
        return "";
    }

    let n = keyvalue.strings[0].length;
    let plainbits = "";

    for(let i = n-1; i < ciphertext.length; i++) {
        let lastfewchars = ciphertext.slice(i-n+1,i);
        let nextcharft = nextChars(keyvalue, lastfewchars);
        let tree = textutils.huffmantree(nextcharft);

        try {
            plainbits = plainbits + textutils.huffmandecodetoken(tree, ciphertext[i]);
        } catch(e) {
            i += n-1; // skip over a seed
        }
    }

    return textutils.frombinarystr(plainbits);
};
exports.decrypt = decrypt;

/**
 * Using the keyvalue frequency table, encrypt the plaintext and return a cipher text string
 * @param plaintext
 * @param keyvalue
 * @param aseed (optional) - if present, seed will be used instead of randomly generated
 */
var encrypt = function (plaintext, keyvalue, aseed) {
    "use strict";

    if(plaintext.length === 0) {
        return "";
    }

    let n = keyvalue.strings[0].length;
    let ciphertext = seed(keyvalue).slice(0, -1); // drop the last character, so that we have a string of length n-1
    if(aseed) {
        ciphertext = aseed;
    }
    let bits = textutils.tobinarystr(plaintext);

    while(bits.length > 0) {
        let lastfewchars = ciphertext.slice(-n + 1);
        if(n == 1) { lastfewchars = ""; } /* Fix for case where n = 1 and we look at the entire string rather than the empty string */

        let nextcharft = nextChars(keyvalue, lastfewchars);

        if(nextcharft.strings.length == 0) {
            // no next characters, so we must re-seed the stream and we are unable to consume any bits
            ciphertext = ciphertext + seed(keyvalue);
        } else {
            let tree = textutils.huffmantree(nextcharft);

            let e = textutils.huffmanencodetoken(tree, bits);
            ciphertext = ciphertext + e.token;
            bits = e.remainingbits;
        }
    }

    return ciphertext;
};
exports.encrypt = encrypt;

/**
 * If method is "hide", encrypt the selection string using the key found in the repository
 * under keyname. If method is "unhide", decrypt the selection string using the key found
 * in the repository under keyname.
 *
 * Returns selection if method is not "hide" nor "unhide" or if another error occurs.
 *
 * @param method "hide" or "unhide"
 * @param selection a string
 * @param keyname a string
 */
var invoke = function (method, selection, keyname) {
    "use strict";
    var keymgmt = require("./keymgmt");

    try {
        switch(method) {
            case "hide":
                return encrypt(selection, keymgmt.getkeyvalue(keyname));
                break;
            case "unhide":
                return decrypt(selection, keymgmt.getkeyvalue(keyname));
                break;
            default:
                console.error("reversehuffman.invoke called with method other than hide or unhide: " + method);
        }
    } catch(e) {
        console.error("reversehuffman.invoke caught exception: " + JSON.stringify(e));
    }
    return selection;
};
exports.invoke = invoke;

var initialize = function () {
    "use strict";

};
exports.initialize = initialize;


/**
 * Return a frequency list that is a subset of keyvalue; the returned frequency list
 * will only contain strings that exist in keyvalue as prefix + s.
 *
 * @param keyvalue a frequency list (an object with arrays 'strings' and 'counts')
 * @param prefix a String of n-1 characters in length
 */
var nextChars = function (keyvalue, prefix) {
    "use strict";

    // Original version, O(n)
    //    let nextcharft = {strings: [], counts: []};
    //    for(let i = 0; i < keyvalue.strings.length; i++) {
    //        if(keyvalue.strings[i].beginsWith(lastfewchars)) {
    //            nextcharft.strings.push(keyvalue.strings[i].slice(-1));
    //            nextcharft.counts.push(keyvalue.counts[i]);
    //        }
    //    }

    let nextcharft = {strings: [], counts: []};
    let startPos = textutils.binaryInsertionPoint(prefix, keyvalue.strings);
    let i = startPos;

    while(i < keyvalue.strings.length && keyvalue.strings[i].beginsWith(prefix)) {
        nextcharft.strings.push(keyvalue.strings[i].slice(-1));
        nextcharft.counts.push(keyvalue.counts[i]);
        i++;
    }

    return nextcharft;
};
exports.nextChars = nextChars;

/**
 * PRIVATE FUNCTIONS FOLLOW -----------------------------------------------------------------------------------------
 */

/**
 * Return a randomly chosen string from object.keys
 * @param keyvalue object with arrays keys and counts
 */
var seed = function (keyvalue) {
    "use strict";

    // Leading spaces may cause problems; the below code tries repeatably to avoid it
    for(let i = 0; i < 100; i++) {
        let choice = arith.randomchoicewithweights(keyvalue);
        if(choice[0] !== ' ') {
            return choice;
        }
    }
    console.error("Failed to find seed without a leading space after 100 tries");
    return choice;
};
