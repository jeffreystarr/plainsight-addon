/**
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
 * distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* arith.js
 *
 * Utility mathematical functions
 */

/**
 * Return the real modulo (versus Javascript's remainder)
 */
var modulo = function (dividend, divisor) {
    return (((dividend) % divisor) + divisor) % divisor;
};
exports.modulo= modulo;


/**
 * Return a randomly-chosen value from choiceobj.strings obeying the weighting of choiceobj.counts
 * @param choiceobj
 */
var randomchoicewithweights = function (choiceobj) {
    "use strict";

    let range = choiceobj.counts.reduce(function (prev, curr) { return prev + curr }, 0);
    let position = Math.floor(Math.random() * range); // position is [0, range)
    let accum = 0;

    for(let i = 0; i < choiceobj.counts.length; i++) {
        accum = accum + choiceobj.counts[i];
        if(position < accum) {
            return choiceobj.strings[i];
        }
    }

    console.error("Failed to select a random choice; position: " + position + " range: " + range);
    return choiceobj.strings[0];
};
exports.randomchoicewithweights = randomchoicewithweights;
