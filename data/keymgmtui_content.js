/**
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
 * distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* keymgmtui_content.js
 *
 * Content script (user interface for keymgmtui.js), loaded with keymgmtui_content.html.
 */

/**
 * Callback on a periodic message. payload carries updated status message and key list
 *
 * @param payload has keys "keys" and "key_gen_status"
 */
var onListResponse = function (payload) {
    let feedback = $("#submit-feedback");
    let keylist = $("#existing-keys-list");

    /* First, set the current status of key generation */
    if(payload.key_gen_status === "") {
        feedback.text("No status to report");
    } else {
        feedback.text(payload.key_gen_status);
    }

    /* Second, align the displayed list of keys with those provided by the system. */
    keylist.empty();
    if(payload.keys.length == 0) {
        let li = keylist.append("<li></li>");
        li.text("(No keys found in repository)");
        li.toggleClass("text-muted", true);
        li.toggleClass("text-primary", false);
    } else {
        payload.keys.forEach(function (key) {
            "use strict";
            let delbutton = $("<button></button>").addClass("btn btn-danger").attr("aira-hidden", "true").html("Delete this key").attr("id", "del-button-" + payload.keys.indexOf(key));

            delbutton.click(function () {
                self.port.emit("reqDelete", {"name": key});
            });

            let li = $('<li><span class="text-primary">' + key + '&nbsp;&nbsp;&nbsp;</span></li>');
            li.append(delbutton);
            keylist.append(li);
        });
    }
};

/* Register handlers for events sent from add-on */
self.port.on("respList", onListResponse);

/* Register handlers for events triggered from content (HTML) */
$("#form-generate-new-key").submit( function () {
    let source_url = $.trim($("#source-url").val());
    let key_name = $.trim($("#key-name").val());

    // TODO: Add validation of inputs prior to submission

    self.port.emit("reqAdd", {"name": key_name, "url": source_url});
    return true;
});
