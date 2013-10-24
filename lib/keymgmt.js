/**
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
 * distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* keymgmt.js
 *
 * Manage keys (add, delete, get, list)
 */

const { EventTarget } = require("sdk/event/target");
let events = EventTarget();
var { on, once, off, emit } = require("sdk/event/core");
var ss = require("sdk/simple-storage");

exports.eventsTarget = events;

/* Initialize data structure in simple-storage for keys */
if(!ss.storage.storedKeys) {
    ss.storage.storedKeys = {};
}

/**
 * Add a key to the repository.
 *
 * Emits keyadded event on successful addition.
 *
 * @param name Human-readable name for this key
 * @param value Content of key
 * @throws DuplicateKeyName, StorageUnavailable
 */
var addkey = function(name, value) {
    if(ss.storage.storedKeys[name]) {
        throw {
            name: "DuplicateKeyName",
            message: "Repository already includes a key with the same name"
        };
    } else {
        ss.storage.storedKeys[name] = value;
        if(ss.quotaUsage > 1.0) {
            delete ss.storage.storedKeys[name];
            throw {
                name: "StorageUnavailable",
                message: "Storing key exceeds storage quota limits"
            };
        }
        emit(events, "keyadded");
    }
};
exports.addkey = addkey;

/**
 * Remove a key from the repository.
 *
 * Emits keydeleted event on successful deletion.
 *
 * @param name
 * @throws KeyNotFound
 */
var deletekey = function(name) {
    if(ss.storage.storedKeys[name]) {
        delete ss.storage.storedKeys[name];
        emit(events, "keydeleted");
    } else {
        throw {
            name: "KeyNotFound",
            message: "Unable to find a key with that name to delete"
        };
    }
};
exports.deletekey = deletekey;

/**
 * Retrieve the key value from the repository given the key's name.
 *
 * @param name
 * @throws KeyNotFound
 */
var getkeyvalue = function(name) {
    if(ss.storage.storedKeys[name]) {
        return ss.storage.storedKeys[name];
    } else {
        throw {
            name: "KeyNotFound",
            message: "Unable to find a key with that name to retrieve"
        };
    }
};
exports.getkeyvalue = getkeyvalue;

/**
 * Return true if a key with name already exists in the repository.
 *
 * @param name
 * @returns {boolean}
 */
var haskey = function(name) {
    "use strict";
    return ss.storage.storedKeys[name];
};
exports.haskey = haskey;

/**
 * Returns a list of key names in the repository
 */
var listkeys = function() {
    let keynames = [];
    for(let propertyname in ss.storage.storedKeys) {
        if(ss.storage.storedKeys.hasOwnProperty(propertyname)) {
            keynames.push(propertyname);
        }
    }
    keynames.sort();
    return keynames;
};
exports.listkeys = listkeys;

/**
 * Returns a number [0, Infinity) indicating percentage of quota currently occupied. A '1' represents 100% of quota.
 *
 * @returns {quotaUsage|*}
 */
var quotause = function() {
    "use strict";
    return ss.quotaUsage;
};
exports.quotause = quotause;
