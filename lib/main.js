/**
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
 * distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/.
 */

var contextMenu = require("sdk/context-menu");
var data = require("sdk/self").data;
var keymgmt = require("./keymgmt");
var keymgmtui = require("./keymgmtui");
var reversehuffman = require("./reversehuffman");
var selection = require("sdk/selection");
var textutils = require("./textutils");
var widget = require("sdk/widget");

exports.main = function(options, callbacks) {
    /* Hide in Plain Site can be invoked by the user selecting some text and, by
     * invoking the context-menu, selecting a key from the context menu.
     */

    /**
     * This is the callback function that calls the steganographic algorithm and supplies the selected
     * texts.
     */
    let executeAlgorithm = function (payload) {
        "use strict";
        if(payload.data) {
            let r = reversehuffman.invoke(payload.method, textutils.cleantext(selection.text.trim()), payload.data);
            selection.text = r;
        }
    };

    /**
     * topMenu is the top-level context menu
     * @type {exports.Menu|*}
     */
    let topMenu = contextMenu.Menu({
        label: "Hide/Unhide Text",
        context: contextMenu.SelectionContext()
    });
    topMenu.addItem(
        contextMenu.Menu({
            label: "Hide",
            items: []
        })
    );
    topMenu.addItem(
        contextMenu.Menu({
            label: "Unhide",
            items: []
        })
    );

    /**
     * Synchronizes context menu with keys in repository
     */
    let syncUIwithKeys = function () {
        "use strict";
        let hideMenu = topMenu.items[0];
        let unhideMenu = topMenu.items[1];

        hideMenu.items.forEach( function (elem) {
            hideMenu.removeItem(elem);
        });
        unhideMenu.items.forEach( function (elem) {
            unhideMenu.removeItem(elem);
        });

        if(keymgmt.listkeys().length === 0) {
            hideMenu.addItem( contextMenu.Item({label: "(No keys found)"}) );
            unhideMenu.addItem( contextMenu.Item({label: "(No keys found)"}) );
        } else {
            keymgmt.listkeys().forEach(function (elem) {
                hideMenu.addItem( contextMenu.Item({
                    label: elem,
                    data: elem,
                    contentScript:  'self.on("click", function (node, data) {' +
                                    '    self.postMessage({node: node, method: "hide", data: data});' +
                                    '});',
                    onMessage: executeAlgorithm
                }));
                unhideMenu.addItem( contextMenu.Item({
                    label: elem,
                    data: elem,
                    contentScript:  'self.on("click", function (node, data) {' +
                                    '    self.postMessage({node: node, method: "unhide", data: data});' +
                                    '});',
                    onMessage: executeAlgorithm
                }));
            });
        }
    };
    syncUIwithKeys();

    keymgmt.eventsTarget.on("keyadded", syncUIwithKeys);
    keymgmt.eventsTarget.on("keydeleted", syncUIwithKeys);

    /**
     * Key management is invoked by the user through a widget
     */
    let keyManagerWidget = widget.Widget({
        id: "plain-sight-key-manager",
        width: 24,
        label: "Key Manager",
        contentURL: data.url("keymgmtui_widget.html"),
        contentScriptFile: data.url("keymgmtui_widget.js")
    });
    keyManagerWidget.port.on("show", function() {
        "use strict";
        keymgmtui.show();
    });
};
