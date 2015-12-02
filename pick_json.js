#!/usr/local/bin/node --harmony
/* Evil eval based utility. Only pass me nice data ... */
'use strict';

var fs = require("fs");
var program = require('commander');
var packageJson = JSON.parse(fs.readFileSync(__dirname + '/package.json').toString());
var colors = require('colors');
var objectExpression;
var json;
var result;

program
	.version(packageJson.version)
	.arguments('<objectExpr>')
	.action(function (expr) {
		objectExpression = expr;
	})
	.option('-a, --array', 'Interpret the json structure as an array. Example: `pick_json [4].id`')
	.on('--help', function () {
		console.log('    $ echo { "foo" : { "bar" : 42 } } |  pick_cli foo.bar #returns 42');
		console.log('    $ echo [ { "bar" : 42 } ] |  pick_cli -a [0].bar #returns 42');
	})
	.parse(process.argv);

if (typeof objectExpression === 'undefined') {
	console.error('no expression given!');
	program.outputHelp(make_red);
	process.exit(1);
}

function make_red (txt) {
	return colors.red(txt); //display the help text in red on the console
}

try {
	json = JSON.parse(fs.readFileSync("/dev/stdin").toString());
} catch (ex) {
	console.error('Could not parse supplied JSON from stdin: ' + ex.message);
	process.exit(1)
}

if (program.array && !Array.isArray(json)) {
	throw new TypeError('JSON is not an array');
}

if(program.array) {
    result = eval('json'+objectExpression);
} else {
    let match = objectExpression.match(/([a-zA-Z0-9-]*)(.*)/);

    let firstPart = match[1];
    let rest = match[2];
    let str = ( 'json["' + firstPart + '"]' + rest);
    result = eval( str );
}

if (result) {
	console.log(result);
} else {
	console.error('No data found using identifier ' + objectExpression);
    process.exit(1);
}

