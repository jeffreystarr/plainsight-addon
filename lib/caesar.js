/**
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
 * distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * caesar.js
 *
 * Encrypt/decrypt text using a Caesar cipher. This module is meant for testing and as an example of
 * an algorithm's interface. The algorithm itself is not based on steganography and is not intended
 * for use in a production system.
 *
 * NB: This is really a Running Key cipher. Rename?
 */

var arith = require("./arith");
var self = require("sdk/self");
var ss = require("sdk/simple-storage");
var textutils = require("./textutils");

/**
 * Return a string decrypting the ciphertext text (a String) using the key
 */
var decrypt = function (ciphertext, key) {
    var plaintext = [];
    var modValue = 0x007A - 0x0021 + 1; /* length of printable characters */
    var c = 0; /* character code within plain */
    var i = 0; /* index within cipher text */
    var j = 0; /* index within key; incremented only when used */
    
    for(i = 0; i < ciphertext.length; i++) {
        c = ciphertext.charCodeAt(i);
        if (c <= 0x007A && c >= 0x0021) { /* Within exclamation mark and tilde (basically, printable characters) */
            plaintext.push( String.fromCharCode( arith.modulo(c - key.charCodeAt(j), modValue) + 0x0021) );
            j = j + 1; /* move along key as it is used */
        } else { /* non-printable or character elsewhere in Unicode than the lower ASCII set */
            plaintext.push(ciphertext.charAt(i));
        }
    }

    return plaintext.join("");
};
exports.decrypt = decrypt;

/**
 * Return a string encrypting the plain text (a String) using the key
 */
var encrypt = function (plain, key) {
    var ciphertext = [];
    var modValue = 0x007A - 0x0021 + 1; /* length of printable characters */
    var c = 0; /* character code within plain */
    var i = 0; /* index within plain text */
    var j = 0; /* index within key; incremented only when used */
    
    for(i = 0; i < plain.length; i++) {
        c = plain.charCodeAt(i);
        if (c <= 0x007A && c >= 0x0021) { /* Within exclamation mark and tilde (basically, printable characters) */
            ciphertext.push( String.fromCharCode( arith.modulo(c + key.charCodeAt(j) - 2 * 0x0021, modValue) + 0x0021 ) );
            j = j + 1; /* move along key as it is used */
        } else { /* non-printable or character elsewhere in Unicode than the lower ASCII set */
            ciphertext.push(plain.charAt(i));
        }
    }
    
    return ciphertext.join("");
};
exports.encrypt = encrypt;

/**
 * method is either the string "hide" or "unhide". selection is a String.
 */
var invoke = function (method, selection) {
    if (!hasInitialized()) {
        initialize();
    }

    switch(method) {
        case "hide":
            return encrypt(selection, ss.storage.key);
            break;
        case "unhide":
            return decrypt(selection, ss.storage.key);
            break;
        default:
            console.error("caesar.invoke called with method other than hide or unhide: " + method);
    }
    return selection;
};
exports.invoke = invoke;

/**
 * Return true if the module has been previously initialized (i.e. a key and other
 * parameters have been loaded into storage).
 */
var hasInitialized = function () {
    return (ss.storage.key && ss.storage.key.length > 0);
};

/**
 * Initialize the key based on a default value or based on the argument value (a string).
 */
var initialize = function () {
    if (arguments.length === 0) {
        ss.storage.key = textutils.collapsePunctuation(textutils.collapseWhitespace(self.data.load("independence.txt")));
    } else {
        ss.storage.key = textutils.collapsePunctuation(textutils.collapseWhitespace(arguments[0]));
    }
};
exports.initialize = initialize;
