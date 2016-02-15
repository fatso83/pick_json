#!/usr/local/bin/node --harmony
/* Evil eval based utility. Only pass me nice data ... */
'use strict';

const fs = require("fs");
const program = require('commander');
const packageJson = JSON.parse(fs.readFileSync(__dirname + '/package.json').toString());
const colors = require('colors');
const util = require('util');
let fileToRead='/dev/stdin';
let objectExpression;
let json;
let result;
let isArray;

program
.version(packageJson.version)
.arguments('<objectExpr> [file]')
.action((expr, file) => {
    objectExpression = expr;
    file && (fileToRead = file);
})
.option('-k, --keys', 'Just output the keys')
.option('-a, --array', '<ignored/deprecated>')
.option('-v, --verbose', 'Verbose errors')
.on('--help', () => {
    console.log('Example\n    $ echo \'[ { "bar" : 42 } ]\' |  pick_json "[0].bar > 40" #returns true');
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

function outputError(txt, error){
    console.error(make_red(txt));
    if(error && program.verbose) {
        console.log(error.stack);
    }
}

try {
    json = JSON.parse(fs.readFileSync(fileToRead).toString());
    isArray = Array.isArray(json);
} catch (ex) {
    outputError(util.format(
        'Could not parse supplied JSON from %s: %s', 
        fileToRead === '/dev/stdin' ? 'stdin' : fileToRead,
        ex.message), ex);
        process.exit(1)
}

let evalString;
try{

    if (objectExpression.match(/^\[\d+\]/)) {
        evalString = 'json'+objectExpression;
    } else {

        // This complex matching allows for evaluation of arbitrary expressions
        // i.e. "servers.filter( name => name == 'redis' )"
        let rangeAlpha = 'a-zA-Z';
        let rangeAlphaNum = `${rangeAlpha}0-9`
        let regex = new RegExp(`\\.?([${rangeAlpha}_][${rangeAlphaNum}_]*)(.*)`);
        let match = objectExpression.match(regex);

        let firstPart = match[1];
        let rest = match[2];
        let str = ( 'json["' + firstPart + '"]' + rest);
        evalString = str;
    }
    result = eval( evalString );

} catch(err){
    outputError(`Failed processing "${objectExpression}"`, err);
    if (isArray) { console.log('Is the expression applicable to an array?'); }
    if(program.verbose) { console.log(`String we tried to evaluate: ${evalString}`); }
    process.exit(1);
}

if (result) {
    if(program.keys){
        console.log(Object.keys(result).join('\n'));
    } else { 
        console.log(JSON.stringify(result, null, 4)); 
    }
} else {
    outputError('No data found using identifier ' + objectExpression, err);
    process.exit(1);
}

