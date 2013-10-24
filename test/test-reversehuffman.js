/**
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
 * distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/.
 */

var rh = require("./reversehuffman");
var textutils = require("./textutils");

///**
// * Generate a large number of random source file and text strings and verify that
// * encrypt/decrypt continue to mirror themselves.
// *
// * This test will likely exceed 'cfx test' test run limit of 1800 seconds.
// *
// * @param assert
// */
//exports["test stress"] = function(assert) {
//    "use strict";
//
//    /**
//     * Returns an integer in the range [0, range)
//     * @param range
//     * @returns {number}
//     */
//    let randomInt = function (range) {
//        return Math.floor(Math.random() * range); // position is [0, range)
//    };
//
//    /**
//     * Returns a string of length len built from random characters
//     * @param len
//     */
//    let randomString = function (len) {
//        let s = "";
//        for(let i = 0; i < len; i++) {
//            s = s + String.fromCharCode(randomInt(128));
//        }
//        return s;
//    };
//    console.log("in stress test");
//    for(let stress = 0; stress < 10; stress++) {
//        // first, generate a random source text 1000 characters in length
//        let source = randomString(10000);
//        let key = textutils.frequencyTable(4, textutils.cleantext(source));
//        console.log("generated source and key");
//
//        for(let i = 0; i < 100; i++) {
//            // second, generate a random original text
//            let original = randomString(25);
//            let ciphertext = rh.encrypt(original, key);
//            let plaintext = rh.decrypt(ciphertext, key);
//
//            if(original !== plaintext) {
//                console.error("original: `" + JSON.stringify(original) + "` plaintext: `" + JSON.stringify(plaintext) + "` ciphertext: `" + JSON.stringify(ciphertext) + "`");
//                assert.fail("stress test");
//            } else {
//                assert.pass("stress test");
//            }
//        }
//    }
//};

exports["test decrypt n1"] = function(assert) {
    "use strict";

    let keyvalue = textutils.frequencyTable(1, "caaabbbbab");

    // nothing should decrypt as nothing
    assert.strictEqual(rh.decrypt("", keyvalue), "");

    // ᐰ == 0x1430 == 0001 0100 0011 0000
    // in the tree, a: 01 b: 1 c: 00
    // in the n=1 case, there is no seed
    assert.strictEqual(rh.decrypt("caaccbbcc", keyvalue), "ᐰ");
};

exports["test encrypt n1"] = function(assert) {
    "use strict";

    let keyvalue = textutils.frequencyTable(1, "caaabbbbab");

    // nothing should encrypt to nothing
    assert.strictEqual(rh.encrypt("", keyvalue), "");

    // ᐰ == 0x1430 == 0001 0100 0011 0000
    // in the tree, a: 01 b: 1 c: 00
    // in the n=1 case, there is no seed
    assert.strictEqual(rh.encrypt("ᐰ", keyvalue), "caaccbbcc");
};

exports["test encrypt n2"] = function(assert) {
    "use strict";

    // FT: xx->2  xy->6  yx->5  yy->3
    let keyvalue = textutils.frequencyTable(2, "xxyxyyxxyyxyxyyxy");
    // for the tree:
    // [[- xy 6 -] - 16 [[[- xx 2 -] - 5 [- yy 3 -]] - 10 [- yx 5 -]]
    // ᐰ == 0x1430 == 0001 0100 0011 0000
    // xy:0 xx:100 yy:101 yx: 11
    // x|: x:0 y:1
    // y|: y:0 x:1

    assert.strictEqual(rh.encrypt("ᐰ", keyvalue, "x"), "xxxxyyxxxxxyxxxxx");
};

exports["test mirror"] = function(assert) {
    "use strict";

    let keyvalue1 = textutils.frequencyTable(1, "caaabbbbab");
    assert.strictEqual(rh.decrypt(rh.encrypt("secret", keyvalue1), keyvalue1), "secret");

    let keyvalue2 = textutils.frequencyTable(2, "xxyxyyxxyyxyxyyxy");
    assert.strictEqual(rh.decrypt(rh.encrypt(String.fromCharCode(1), keyvalue2, "x"), keyvalue2), String.fromCharCode(1));
    assert.strictEqual(rh.decrypt(rh.encrypt("secret", keyvalue2), keyvalue2), "secret");

    // pp, pq, must re-seed on pq
    let keyvalue3 = textutils.frequencyTable(2, "ppq");
    assert.strictEqual(rh.decrypt(rh.encrypt(String.fromCharCode(0xA), keyvalue3), keyvalue3), String.fromCharCode(0xA));
};

exports["test nextChars"] = function(assert) {
    "use strict";

    // aaa aab abb bba bab abb
    let ft = textutils.frequencyTable(3, "aaabbabb");

    assert.deepEqual(rh.nextChars(ft, "aa"), {strings: ["a", "b"], counts: [1, 1]});
    assert.deepEqual(rh.nextChars(ft, "ab"), {strings: ["b"], counts: [2]});
    assert.deepEqual(rh.nextChars(ft, "ba"), {strings: ["b"], counts: [1]});
    assert.deepEqual(rh.nextChars(ft, "bb"), {strings: ["a"], counts: [1]});
};

require("sdk/test").run(exports);
