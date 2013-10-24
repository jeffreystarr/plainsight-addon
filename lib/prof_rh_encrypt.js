var fs = require("fs");
var rh = require("./reversehuffman");
var textutils = require("./textutils");

let source = fs.readFileSync("../doc/independence.txt", {encoding: "utf-8", flag: "r"});
let ft = textutils.frequencyTable(4, source);

for(let i = 0; i < 1000; i++) {
	rh.encrypt("this is some plain text", ft);
}

