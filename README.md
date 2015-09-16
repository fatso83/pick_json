# pick_json
> Command line utility to extract an object from a deeply nested json structure

## Reading from a file

We are using the following json data file as input data in the examples
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

## Extracting data from a http service
Use curl to extract the data and pipe it into `pick_json`

```
curl -s mysite.com/service.json | pick stats.uptime 
```

