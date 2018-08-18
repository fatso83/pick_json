# pick_json
> Cross-platform command line utility to extract and/or evaluate json. 
> No weird new language or syntax; just use basic javascript notation in your one-liners. 
> Pipe data into it as part of script chain or read from a file. Honey Badger doesn't care.

[![Say Thanks!](https://img.shields.io/badge/Say%20Thanks-!-1EAEDB.svg)](https://saythanks.io/to/fatso83)

## Options
```
  Usage: pick_json [options]

  Options:

    -h, --help              output usage information
    -V, --version           output the version number
    -k, --keys              Just output the keys. Will output the root keys if no expression is given
    -e, --exp <expression>  Expression to filter the json. Must start with an attribute or index
    -f, --file <file>       Use <file> instead of standard input
    -v, --verbose           Verbose errors

Example
    $ echo '[ { "bar" : 42 } ]' |  pick_json -e "[0].bar > 40" #returns true
```

## Installation
Assumes you have Node installed
```
npm install -g pick_json
```

## Examples

We are using the following json data file as input data in the examples. You can find it in the `test` directory
```javascript
{
   "redis": {
      "connected": true,
      "ready": true,
      "connections": 1,
      "commandsSent": 9,
      "commandQueue": {
         "tail": [],
         "head": [],
         "offset": 0
      }
   },
   "error_codes" : [2001, 4004]
}
```

### Picking from an array
```
pick_json -e error_codes[1] test/example.json
```
 returns `4004`

### Picking from a nested structure
```
pick_json -e redis.connected test/example.json
```
returns `true`

### Filtering data
Remember, the `expr` can be *any* valid expression operating on the data
```
pick_json -e "error_data.filter(err => err > 3000)" data.json
```
returns `[4004]`

### When receiving an array
```
echo [ { "bar" : 42 } ] |  pick_cli [0].bar 
```
returns `42`

## Extracting data from a http service
Use curl to extract the data and pipe it into `pick_json`

```
curl -s mysite.com/service.json | pick_json -e stats.uptime 
```

