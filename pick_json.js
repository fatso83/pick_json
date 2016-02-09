#!/usr/local/bin/node --harmony
/* Evil eval based utility. Only pass me nice data ... */
'use strict';

var fs = require("fs");
var program = require('commander');
var packageJson = JSON.parse(fs.readFileSync(__dirname + '/package.json').toString());
var colors = require('colors');
var util = require('util');
var fileToRead='/dev/stdin';
var objectExpression;
var json;
var result;

program
    .version(packageJson.version)
    .arguments('<objectExpr> [file]')
    .action(function (expr, file) {
        objectExpression = expr;
        file && (fileToRead = file);
    })
    .option('-a, --array', 'Interpret the json structure as an array. Example: `pick_json [4].id`')
    .option('-k, --keys', 'Just output the keys')
    .on('--help', function () {
        console.log('    $ echo { "foo" : { "bar" : 42 } } |  pick_cli foo.bar #returns 42');
        console.log('    $ echo [ { "bar" : 42 } ] |  pick_cli -a "[0].bar > 40" #returns true');
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
	json = JSON.parse(fs.readFileSync(fileToRead).toString());
} catch (ex) {
	console.error(util.format(
        'Could not parse supplied JSON from %s: %s', 
        fileToRead === '/dev/stdin' ? 'stdin' : fileToRead,
        ex.message));
	process.exit(1)
}

if (program.array && !Array.isArray(json)) {
	throw new TypeError('JSON is not an array');
}

if(program.array) {
    result = eval('json'+objectExpression);
} else {
    let match = objectExpression.match(/([a-zA-Z0-9-_]*)(.*)/);

    let firstPart = match[1];
    let rest = match[2];
    let str = ( 'json["' + firstPart + '"]' + rest);
    result = eval( str );
}

if (result) {
    if(program.keys){
        console.log(Object.keys(result).join('\n'));
    } else { 
        console.log(JSON.stringify(result, null, 4)); 
    }
} else {
	console.error('No data found using identifier ' + objectExpression);
    process.exit(1);
}

