/**
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
 * distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* textutils.js
 *
 * Utility functions for strings
 */

var priority = require("./priority_queue");

/**
 * Given a sorted array arr, return the position (actual or required to maintain sorted order)
 * of v in arr.
 *
 * @param v
 * @param arr
 */
var binaryInsertionPoint = function(v, arr) {
    let lower = 0;
    let upper = Math.max(arr.length - 1, 0);
    let mid = Math.floor((lower + upper) / 2);

    while(upper >= lower) {
        if(arr[mid] === v) {
            return mid;
        }
        if(v < arr[mid]) {
            upper = mid - 1;
        } else {
            lower = mid + 1;
        }
        mid = Math.floor((lower + upper) / 2);
    }

    /* not found */
    if(v < arr[mid]) {
        return mid;
    } else {
        return mid + 1;
    }
};
exports.binaryInsertionPoint = binaryInsertionPoint;

/**
 * Return a string of s in a 'cleaner' form without special characters that can be confused in HTML transit.
 * Furthermore, replace multiple spaces by a single space.
 * @param s
 */
var cleantext = function (s) {
    "use strict";

    let clean = s.replace(/\s/g, " "); // change any whitespace -> single space
    clean = clean.replace(/\s+/g, " "); // replace 2 or more spaces with 1
    clean = clean.replace(/["'&<>]/g, ""); // eliminate reserved characters

    return clean;
};
exports.cleantext = cleantext;

/**
 * Return the string s with whitespace removed
 */
var collapseWhitespace = function (s) {
    return s.replace(/\s/g, "");
};
exports.collapseWhitespace = collapseWhitespace;

/**
 * Return the string s with punctuation removed
 *
 * Punctuation is equivalent to unicode groups 0021-002F (ASCII Punctuation
 * and Symbols), 005B-0060 (more ASCII Punctuation and Symbols), and
 * 00A1-00BF (Latin-1 Punctuation and Symbols). Note that the 'space'
 * character (0020 and 00A0) is within the normal ranges of punctuation but
 * is excluded in this definition.
 */
var collapsePunctuation = function (s) {
    return s.replace(/[\u0021-\u002F]|[\u005B-\u0060]|[\u00A1-\u00BF]/g, "");
};
exports.collapsePunctuation = collapsePunctuation;

/**
 * Given a string str, compute all n-length substrings and their frequencies within str.
 * Return a frequency table: {strings: [s, ...], counts: [c, ...]} where all s will
 * be strings of length n, s will be a substring of str, and c will be an integer greater
 * than zero equalling the number of occurrences of s within str. strings will be in
 * sorted order.
 *
 * @param n integer, length of string (must be greater than 0)
 * @param str
 */
var frequencyTable = function (n, str) {
    let fTable = {strings: [], counts: []};
    let i = 0;

    if(n < 1) {
        throw {
            name: "InvalidArgument",
            message: "n must be a positive integer"
        };
    }

    /* fTable.strings and fTable.counts will be maintained in sorted order throughout */
    for(i = 0; i < str.length - n + 1; i++) {
        let s = str.substring(i, i + n);
        let insertionPoint = binaryInsertionPoint(s, fTable.strings);

        if(fTable.strings[insertionPoint] === s) {
            /* s already in fTable.strings and fTable.counts */
            fTable.counts[insertionPoint] = fTable.counts[insertionPoint] + 1;
        } else {
            /* s needs to be inserted into fTable.strings and fTable.counts */
            fTable.strings.splice(insertionPoint, 0, s);
            fTable.counts.splice(insertionPoint, 0, 1);
        }
    }

    return fTable;
};
exports.frequencyTable = frequencyTable;

/**
 * Return a string by decoding the binary string bits. This function will ignore extraneous bits.
 * Assumption: UTF-16 encoding.
 *
 * @param bits a string populated with 0s and 1s
 */
var frombinarystr = function (bits) {
    "use strict";

    let decoded = "";
    for(let i = 0; i < Math.floor(bits.length / 16); i++) {
        decoded = decoded + String.fromCharCode(parseInt(bits.slice(16*i, 16*(i+1)), 2));
    }

    return decoded;
};
exports.frombinarystr = frombinarystr;

/**
 * Return a binary string for the token in htree. Throws NotFound Error if token is not in htree.
 * @param htree a Huffman tree - nodes of [left, token, weight, right]
 * @param token a String
 */
var huffmandecodetoken = function (htree, token) {
    "use strict";

    /* The token could be anywhere in the Huffman tree, although probabilistically it is more likely
     * on the 'right' than the 'left'. We will use a depth first strategy.
     */

    let nodes = []; // stack of {node, path} entries for search
    nodes.push({node: htree, path: []});

    while(nodes.length > 0) {
        let entry = nodes.pop();

        if(entry.node[1] === token) {
            return entry.path.join("");
        } else {
            if(entry.node[1]) {
                // terminal node, do nothing
            } else {
                // non-terminal node, add left and right paths to stack
                nodes.push({node: entry.node[0], path: entry.path.concat("0")});
                nodes.push({node: entry.node[3], path: entry.path.concat("1")});
            }
        }
    }

    throw new Error("NotFound");
};
exports.huffmandecodetoken = huffmandecodetoken;

/**
 * Return an object with keys token (a string) and remainingbits (an bit string - strings of 0 and 1s)
 * @param htree a Huffman tree - nodes of [left, token, weight, right]
 * @param bits a bit string (string of 0 and 1)
 */
var huffmanencodetoken = function (htree, bits) {
    "use strict";

    if(htree.length != 4) {
        throw {name: "IllegalArgument", message: "htree must be an array with 4-elements"};
    }
    if(bits.length == 0) {
        throw {name: "IllegalArgument", message: "bits must be non-empty"};
    }

    let htreepos = htree;
    for(let i = 0; i < bits.length; i++) {
        if(htreepos[1]) {
            // terminal node in htree
            return {token: htreepos[1], remainingbits: bits.slice(i)};
        } else {
            // non-terminal node
            switch(bits[i]) {
                case "0": htreepos = htreepos[0]; break; // left
                case "1": htreepos = htreepos[3]; break; // right
                default:  throw {name: "InternalError", message: "bits contains a non-0 or 1"};
            }
        }
    }

    // ran out of bits; pad 'virtual' left bits until we hit a terminal node
    while(!htreepos[1]) {
        htreepos = htreepos[0];
    }
    return {token: htreepos[1], remainingbits: ""};
};
exports.huffmanencodetoken = huffmanencodetoken;

/**
 * Returns a Huffman tree given a frequency table.
 *
 * The tree is encoded as an array with 4-elements: left, token (string), w (weight, number > 0), right
 * with left and right 4-element arrays (and recursively) or null.
 * @param freqtable
 */
var huffmantree = function (freqtable) {
    "use strict";

    /* first, some validation of freqtable */
    if(freqtable.strings.length === 0) {
        return [];
    }
    if(freqtable.strings.length != freqtable.counts.length) {
        throw {name: "ArraySizeMismatch", message: "Frequency table strings.length != counts.length"};
    }

    /* See _Introduction to Algorithms, Second Edition_ by Cormen, et al. on page 388 */
    let Q = priority.PriorityQueue({low: true});
    // Q will contain 4-element arrays: left, token (string), w (weight, number > 0), right
    for(let i = 0; i < freqtable.strings.length; i++) {
        Q.push([null, freqtable.strings[i], freqtable.counts[i], null], freqtable.counts[i]);
    }

    for(let i = 0; i < freqtable.strings.length - 1; i++) {
        let left = Q.pop();  // Extract-Min
        let right = Q.pop(); // Extract-Min
        let wz = left[2] + right[2];
        Q.push([left, null, wz, right], wz);
    }

    return Q.pop();
};
exports.huffmantree = huffmantree;

/**
 * Return a bit string (a string of characters '0' and '1' representing the UTF-16 encoding of str.
 * @param str
 */
var tobinarystr = function(str) {
    "use strict";

    let bitstr = "";
    for(let i = 0; i < str.length; i++) {
        let woleadingzeros = str.charCodeAt(i).toString(2);

        // pad 0 onto the front until the string is 16 characters long
        while(woleadingzeros.length < 16) {
            woleadingzeros = "0" + woleadingzeros;
        }

        bitstr = bitstr + woleadingzeros;
    }

    return bitstr;
};
exports.tobinarystr = tobinarystr;
