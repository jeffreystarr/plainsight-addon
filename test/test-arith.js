/**
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
 * distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/.
 */

var arith = require("./arith");

exports["test modulo"] = function(assert) {
    assert.strictEqual(arith.modulo(-1, 90), 89);
};

exports["test randomchoicewithweights"] = function(assert) {
    "use strict";

    // NB: a value of zero in the counts array is normally in violation of the contract
    let choice = {strings: ["a", "b", "c"], counts: [0, 2, 0]};
    assert.strictEqual(arith.randomchoicewithweights(choice), "b");
};

require("sdk/test").run(exports);
