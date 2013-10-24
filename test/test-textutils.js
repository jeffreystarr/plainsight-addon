/**
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
 * distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/.
 */

var textutils = require("./textutils");

exports["test cleantext"] = function(assert) {
    "use strict";

    assert.strictEqual(textutils.cleantext(""), "");
    assert.strictEqual(textutils.cleantext("\t"), " "); // tab -> space
    assert.strictEqual(textutils.cleantext(" <foo\t&q'\"v>\t\tz"), " foo qv z"); // multiple spaces are reduced to one
}

exports["test collapseWhitespace"] = function(assert) {
    assert.strictEqual(textutils.collapseWhitespace("foo bar"), "foobar");
    assert.strictEqual(textutils.collapseWhitespace("foo      qux"), "fooqux");
    assert.strictEqual(textutils.collapseWhitespace("a b c d "), "abcd");
    assert.strictEqual(textutils.collapseWhitespace(""), "");
};

exports["test collapsePunctuation"] = function(assert) {
    assert.strictEqual(textutils.collapsePunctuation("Hello, world!"), "Hello world");
    assert.strictEqual(textutils.collapsePunctuation("See §7.4"), "See 74");
};

exports["test frequencyTable"] = function(assert) {
    assert.deepEqual(textutils.frequencyTable(2, ""), {strings: [], counts: []});
    assert.deepEqual(textutils.frequencyTable(2, "abcde"), {strings: ["ab", "bc", "cd", "de"], counts: [1, 1, 1, 1]});
    assert.deepEqual(textutils.frequencyTable(3, "abcde"), {strings: ["abc", "bcd", "cde"], counts: [1, 1, 1]});
    assert.deepEqual(textutils.frequencyTable(2, "abcdefab"), {strings: ["ab", "bc", "cd", "de", "ef", "fa"], counts: [2, 1, 1, 1, 1, 1]});
    assert.deepEqual(textutils.frequencyTable(1, "caaabbbbab"), {strings: ["a", "b", "c"], counts: [4, 5, 1]});
};

exports["test frombinarystr"] = function(assert) {
    "use strict";

    assert.strictEqual(textutils.frombinarystr(""), "");
    assert.strictEqual(textutils.frombinarystr("00000000011000010000000001100010"), "ab");
    assert.strictEqual(textutils.frombinarystr("000000000110000100000000011000101111"), "ab");
};

exports["test huffmandecodetoken"] = function(assert) {
    "use strict";

    let tree = textutils.huffmantree(textutils.frequencyTable(1, "caaabbbbab"));

    assert.strictEqual(textutils.huffmandecodetoken(tree, "a"), "01");
    assert.strictEqual(textutils.huffmandecodetoken(tree, "b"), "1");
    assert.strictEqual(textutils.huffmandecodetoken(tree, "c"), "00");
    assert.throws(function () {textutils.huffmandecodetoken(tree, "d")}, Error, "NotFound");
};

exports["test huffmanencodetoken"] = function(assert) {
    "use strict";

    let tree = textutils.huffmantree(textutils.frequencyTable(1, "caaabbbbab"));
    assert.deepEqual(textutils.huffmanencodetoken(tree, "1"), {token: "b", remainingbits: ""});
    assert.deepEqual(textutils.huffmanencodetoken(tree, "00"), {token: "c", remainingbits: ""});
    assert.deepEqual(textutils.huffmanencodetoken(tree, "011100"), {token: "a", remainingbits: "1100"});
};

exports["test huffmantree"] = function(assert) {
    "use strict";

    // an empty frequency table will yield an empty array
    assert.deepEqual(textutils.huffmantree(textutils.frequencyTable(2, "")), []);

    // verify singleton
    assert.deepEqual(textutils.huffmantree(textutils.frequencyTable(2, "xy")), [null, "xy", 1, null]);

    // expected tree for caaabbbbab: ((null "b" 5 null) null 10 ((null "a" 4 null) null 5 (null "c" 1 null))
    let huff = [[[null, "c", 1, null], null, 5, [null, "a", 4, null]],null,10,[null,"b",5,null]];
    assert.deepEqual(textutils.huffmantree(textutils.frequencyTable(1, "caaabbbbab")), huff);

    // FT: xx->2  xy->6  yx->5  yy->3
    // [[- xy 6 -] - 16 [[[- xx 2 -] - 5 [- yy 3 -]] - 10 [- yx 5 -]]
    let ft = textutils.frequencyTable(2, "xxyxyyxxyyxyxyyxy");
    assert.deepEqual(textutils.huffmantree(ft), [[null, "xy", 6, null], null, 16, [[[null, "xx", 2, null], null, 5, [null, "yy", 3, null]], null, 10, [null, "yx", 5, null]]]);
};

exports["test tobinarystr"] = function(assert) {
    "use strict";

    // ab == 0x0061 0x0062 == 00000000 01100001 00000000 01100010
    assert.strictEqual(textutils.tobinarystr("ab"), "00000000011000010000000001100010");
};

require("sdk/test").run(exports);
