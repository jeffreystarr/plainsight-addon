var fs = require("fs");
var textutils = require("./textutils");

let source = fs.readFileSync("../doc/independence.txt", {encoding: "utf-8", flag: "r"});

console.log("File length: " + source.length);

for(let i = 0; i < 10000; i++) {
	textutils.frequencyTable(4, source);
}

