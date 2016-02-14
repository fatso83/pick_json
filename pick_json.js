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

function outputError(txt){
    console.error(make_red(txt));
}

try {
    json = JSON.parse(fs.readFileSync(fileToRead).toString());
    isArray = Array.isArray(json);
} catch (ex) {
    outputError(util.format(
        'Could not parse supplied JSON from %s: %s', 
        fileToRead === '/dev/stdin' ? 'stdin' : fileToRead,
        ex.message));
        process.exit(1)
}

try{

    if (isArray) {
        let safeExp;

        if (objectExpression.match(/^\[\d+\]/)) {
            safeExp = objectExpression;
        } else if (!objectExpression.startsWith('.')) {
            safeExp = '.' + objectExpression;
        } else if (objectExpression.startsWith('.')) {
            safeExp = objectExpression;
        } else {
            outputError('Expressions on arrays must start with indexes or properties of an array');
            program.outputHelp();
            process.exit(1);
        }
        result = eval('json'+safeExp);
    } else {
        // This complex matching allows for evaluation of arbitrary expressions
        // i.e. "servers.filter( name => name == 'redis' )"
        let match = objectExpression.match(/([a-zA-Z0-9-_]*)(.*)/);

        let firstPart = match[1];
        let rest = match[2];
        let str = ( 'json["' + firstPart + '"]' + rest);
        result = eval( str );
    }
} catch(err){
    outputError(`Failed processing "${objectExpression}"`);
    if (isArray) { console.log('Is the expression applicable to an array?'); }
    process.exit(1);
}

if (result) {
    if(program.keys){
        console.log(Object.keys(result).join('\n'));
    } else { 
        console.log(JSON.stringify(result, null, 4)); 
    }
} else {
    outputError('No data found using identifier ' + objectExpression);
    process.exit(1);
}

