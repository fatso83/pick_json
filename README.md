# pick_json
> Command line utility to extract an object from a deeply nested json structure
> Useful as parts of script chains when reading from files or from curl

## Options
```
  Usage: pick_json [options] <expr> [file]

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    -a, --array    Interpret the json structure as an array
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
pick_json error_codes[1] < test/example.json
```
 returns `4004`

### Picking from a nested structure
```
pick_json redis.connected < test/example.json
```
returns `true`

### Filtering data
Remember, the `expr` can be *any* valid expression operating on the data
```
pick_json "error_data.filter(err => err > 3000)" < data.json
```
returns `[4004]`

### When receiving an array
```
echo [ { "bar" : 42 } ] |  pick_cli --array [0].bar 
```
returns `42`

## Extracting data from a http service
Use curl to extract the data and pipe it into `pick_json`

```
curl -s mysite.com/service.json | pick_json stats.uptime 
```

