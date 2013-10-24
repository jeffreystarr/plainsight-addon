/**
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
 * distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/.
 */

var caesar = require("./caesar");

exports["test encrypt/decrypt"] = function(assert) {
    /* verify decrypting the result of encryption yields the original response */
    assert.strictEqual(caesar.decrypt(caesar.encrypt("flee at once", "errorscanocc"), "errorscanocc"), "flee at once", "fail if cannot decrypt encrypted text");
};

exports["test encrypt 0"] = function(assert) {
    /* !!!!! is equivalent to an offset of zero */
    assert.strictEqual(caesar.encrypt("01234", "!!!!!"), "01234", "encrypt identity");
};

exports["test decrypt 0"] = function(assert) {
    /* !!!!! is equivalent to an offset of zero */
    assert.strictEqual(caesar.decrypt("QRSTU", "!!!!!"), "QRSTU", "decrypt identity");
};

exports["test encrypt 3"] = function(assert) {
    /* $$$$$ is equivalent to an offset of three */
    assert.strictEqual(caesar.encrypt("01234", "$$$$$"), "34567", "encrypt by 3");
};

exports["test decrypt 3"] = function(assert) {
    /* $$$$$ is equivalent to an offset of three */
    assert.strictEqual(caesar.decrypt("34567", "$$$$$"), "01234", "decrypt by 3");
};

exports["test encrypt wrap"] = function(assert) {
    assert.strictEqual(caesar.encrypt("z", "$"), "#", "encrypt wrap");
};

exports["test decrypt wrap"] = function(assert) {
    assert.strictEqual(caesar.decrypt("#", "$"), "z", "decrypt wrap");
};

exports["test encrypt not a no-op"] = function(assert) {
    /* verify we cannot pass with a no op */
    assert.notStrictEqual(caesar.encrypt("flee at once", "errors can o"), "flee at once", "fail if no-op");
};

require("sdk/test").run(exports);
