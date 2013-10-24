/**
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
 * distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* keymgmtui.js
 *
 * Interface to generate and delete keys
 */

var keymgmt = require("./keymgmt");
var data = require("sdk/self").data;
var Request = require("sdk/request").Request;
var tabs = require("sdk/tabs");
var textutils = require("./textutils");
var timers = require("sdk/timers");

/**
 * worker is a page worker and is initialized within show()
 */
var worker = null;
/**
 * key_gen_status is a global 'error' string that is periodically pushed to the keymgmtui_content
 * by onList
 * @type {string}
 */
var key_gen_status = "";

/**
 * User has requested a new key to be generated
 *
 * @param payload an object with keys name, url, and offset
 */
var onAdd = function (payload) {
    let name = payload.name;
    let url = payload.url;

    let request = Request({
        "url": url,
        onComplete: function (response) {
            "use strict";
            key_gen_status = "Key being generated from source content. Please wait.";
            let cleantext = textutils.cleantext(response.text);
            let fTable = textutils.frequencyTable(4, cleantext);
            try {
                keymgmt.addkey(name, fTable);
                key_gen_status = "Key " + name + " generated and added to repository";
                console.log("key generated and added");
            } catch (e) {
                if(e.name === "DuplicateKeyName") {
                    key_gen_status = "There is already a key with that name in the repository. Try a different name.";
                } else if(e.name === "StorageUnavailable") {
                    key_gen_status = "Insufficient space in repository to store key. Either use a smaller source content or free space by deleting existing keys.";
                } else {
                    key_gen_status = "Key generation failed (unknown reason)";
                }
                console.error("key generation failed: " + JSON.stringify(e));
            }
        }
    });

    request.get();
};

var onDelete = function (payload) {
    "use strict";
    if(payload.name) {
        try {
            keymgmt.deletekey(payload.name);
            key_gen_status = "Key " + payload.name + " deleted from repository";
        } catch (e) {
            console.error("key deletion failed: " + JSON.stringify(e));
            if(e.name === "NotFound") {
                key_gen_status = "Key " + payload.name + " was not found in repository for deletion";
            } else {
                key_gen_status = "Key deletion failed (unknown reason)";
            }
        }
    }
};

var onList = function () {
    if(worker) {
        let message = {"keys": keymgmt.listkeys(), "key_gen_status": key_gen_status};
        worker.port.emit("respList", message);
    }
};

var show = function () {
    let timer = timers.setInterval(onList, 500); /* call onList every 500 ms */

    tabs.open({
        url: data.url("keymgmtui_content.html"),
        onReady: function (tab) {
            worker = tab.attach({
                contentScriptFile: [data.url("jquery-2.0.3.min.js"), data.url("keymgmtui_content.js")]
            });

            worker.port.on("reqAdd", onAdd);
            worker.port.on("reqDelete", onDelete);
        },
        onClose: function (tab) {
            "use strict";
            timers.clearInterval(timer);
        }
    });
};
exports.show = show;
