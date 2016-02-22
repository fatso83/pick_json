#!/usr/bin/env node --harmony
/* Evil eval based utility. Only pass me nice data ... */
'use strict';

const fs = require("fs");
const program = require('commander');
const packageJson = JSON.parse(fs.readFileSync(__dirname + '/package.json').toString());
const colors = require('colors');
const util = require('util');
let readable = process.stdin;
let stringData = "";
let objectExpression;
let evalString;
let json;
let result;
let isArray;

program
.version(packageJson.version)
.option('-k, --keys', 'Just output the keys. Will output the root keys if no expression is given')
.option('-e, --exp <expression>', 'Expression to filter the json. Must start with an attribute or index')
.option('-f, --file <file>', 'Use <file> instead of standard input')
.option('-v, --verbose', 'Verbose errors')
.on('--help', () => {
    console.log('Example\n    $ echo \'[ { "bar" : 42 } ]\' |  pick_json -e "[0].bar > 40" #returns true');
})
.parse(process.argv);

if (!program.keys && (typeof program.exp=== 'undefined')) {
    console.error('no expression given!');
    program.outputHelp(make_red);
    process.exit(1);
}

if(program.args.length) {
    outputError(`You supplied arguments that were not prefixed by an option flag: "${program.args}". Aborting.`);
    process.exit(1);
}

if(program.file) {
    readable = fs.createReadStream(program.file);
}

readable.setEncoding('utf8');

readable.on('data', (chunk) => {
      debugOutput(`got ${chunk.length} bytes of data\n`);
      stringData += chunk;
});

readable.on('end', () => {
    evaluateJSON(stringData);
});

readable.on('error', (err) => {
    outputError('Error occurred on reading data', err);
    process.exit(1);
});


function make_red (txt) {
    return colors.red(txt); //display the help text in red on the console
}

function outputError(txt, error){
    console.error(make_red(txt));
    if(error && program.verbose) {
        console.log(error.stack);
    }
}

// Do not output red colored output. Simply avoid mixing the output with the stdout
function debugOutput(txt) {
    if(program.verbose){
        process.stderr.write('> ' + txt);
    }
}

function evaluateJSON(stringData) {
    try {
        json = JSON.parse(stringData);
        isArray = Array.isArray(json);
    } catch (ex) {
        outputError(util.format(
            'Could not parse supplied JSON from %s: %s', 
            readable === process.stdin ? 'stdin' : readable.path,
            ex.message), ex);
            process.exit(1)
    }

    objectExpression = program.exp;
    try{

        if (!objectExpression) {
            evalString = 'json';
        } else if (objectExpression.match(/^\[\d+\]/)) {
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
        debugOutput(`String we tried to evaluate: ${evalString}`);
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
}

