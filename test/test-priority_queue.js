/**
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
 * distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/.
 */

var priority = require("./priority_queue");

exports["test queue"] = function(assert) {
    "use strict";

    let q = priority.PriorityQueue({low: true});

    assert.strictEqual(q.empty(), true);
    q.push("a", 2);
    q.push("b", 1);
    q.push("c", 3);
    assert.strictEqual(q.pop(), "b");
    assert.strictEqual(q.pop(), "a");
    assert.strictEqual(q.pop(), "c");
    assert.strictEqual(q.empty(), true);
};

require("sdk/test").run(exports);
