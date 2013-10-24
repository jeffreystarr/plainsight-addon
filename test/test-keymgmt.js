/**
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
 * distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/.
 */

var { on, once, off, emit } = require("sdk/event/core");
var keymgmt = require("./keymgmt");
var ss = require("sdk/simple-storage");

exports["test addkey"] = function(assert) {
    keymgmt.addkey("foo", [{"abc": 3}]);

    assert.ok(ss.storage.storedKeys["foo"]); /* value is in repository */
    assert.ok(!ss.storage.storedKeys["bar"]); /* value is not in repository (correctly) */
};

exports["test addkey duplicate"] = function(assert) {
    keymgmt.addkey("baz", [{"abc": 3}]);
    assert.throws(
        function() {
            keymgmt.addkey("baz", [{"abc": 3}]);
        },
        "exception raised"
    );
};

exports["test addkey event"] = function(assert) {
    "use strict";

    let target = {name: "target"};
    let triggered = false;

    keymgmt.eventsTarget.on('keyadded', function () {
        triggered = true;
    });
    keymgmt.addkey("a new key", [{"abc": 3}]);

    if(triggered) {
        assert.pass();
    } else {
        assert.fail("keyadded event not triggered");
    }
};

exports["test addkey quota"] = function(assert) {
    /* Per the docs, the quota is about five megabytes. Our large value will >= 16 megabytes. */
    let largeValue = "x";
    let i = 0;
    for(i = 0; i < 24; i++) {
        largeValue = largeValue + largeValue;
    } // largeValue is now 2 ^ 24 characters

    assert.throws(
        function() {
            keymgmt.addkey("large", largeValue);
        },
        "exception raised"
    );
};

exports["test delete"] = function(assert) {
    let triggered = false;
    keymgmt.eventsTarget.on('keydeleted', function () {
        "use strict";
        triggered = true;
    });

    keymgmt.addkey("todelete", {});
    assert.ok(ss.storage.storedKeys["todelete"]); // verify something exists to be deleted
    keymgmt.deletekey("todelete");
    assert.ok(!ss.storage.storedKeys["todelete"]); // deleted

    if(triggered) {
        assert.pass();
    } else {
        assert.fail("keydeleted event not triggered");
    }

    assert.throws(
        function() {
            keymgmt.deletekey("todelete");
        },
        "exception raised"
    );
};

exports["test getkeyvalue"] = function(assert) {
    let value = [{"abc": 4}, {"abd": 2}];

    keymgmt.addkey("toberetrieved", value);

    assert.strictEqual(keymgmt.getkeyvalue("toberetrieved"), value);

    assert.throws(
        function() {
            keymgmt.getkeyvalue("doesnotexist");
        },
        "exception raised"
    );
};

exports["test listkeys"] = function(assert) {
    assert.deepEqual(keymgmt.listkeys(),["a new key", "baz", "foo", "toberetrieved"]);
};

require("sdk/test").run(exports);
