# Short Distributed ID generator module

This module was inspired by [icicle](https://github.com/intenthq/icicle) and [snowflake](https://github.com/twitter/snowflake). The ideas is to be able to generate non-colliding, URL friendly, and relatively short IDs that could be used in any application that requires to create URIs for arbitrary resources.

Looking around for what is available, I failed to find anything that would be simple and easy to implement. As a result, this module was born.

The id is a 64bit unsigned integer with 42 bits used for current timestamp in milliseconds, 10 bits used for shard id, and final 12 bits are used for revolving sequence.

| timestamp_ms | shard_id | sequence |
|:---:|:---:|:---:|
| 42bit | 10bit | 12bit |

## short-duid-js

Official repository is at <http://gotfix.com/pixnr/short-duid-js>

[![build status](https://gotfix.com/pixnr/short-duid-js/badges/master/build.svg)](https://gotfix.com/pixnr/short-duid-js/commits/master)
[![npm dependencies](https://david-dm.org/phpb-com/short-duid-js.svg)](https://david-dm.org/phpb-com/short-duid-js)
[![npm version](https://img.shields.io/npm/v/short-duid-js.svg?style=flat-square)](https://www.npmjs.com/package/short-duid-js)
[![npm downloads](https://img.shields.io/npm/dm/short-duid-js.svg?style=flat-square)](https://www.npmjs.com/package/short-duid-js)

### Changelog
- 1.1.1 No changes to the code, fixing CI pipeline
- 1.1.0 Major update of dependencies
- 1.0.2 Minor fixes 
- 1.0.0 Initial release

### Requirements
- node.js 0.12+ or iojs 2+

### Features
- Written in pure JavaScript, no native code
- Time and sequence based numeric unique ID generation
- Time and sequence based alphanumeric URL-safe unique ID generation
- Designed to be distributed among 1024 shards, no need to synchronize runtime or after setup
- Can generate 4096 unique IDs per millisecond per shard (theoretically)
- Can generate unique IDs for 139 years without overflow or collision
- Resilient to time drift or sequence overflow, does not delay ID generation
- Allows to set custom epoch, prolong unique ID generation and shorten the ID
- Simple to use

### Notes
This module is roughly 5 times slower compared to its native implementation [https://gotfix.com/pixnr/short-duid](https://gotfix.com/pixnr/short-duid) but does not require any compilation, including dependencies. If speed is what you need, please use [short-duid](https://gotfix.com/pixnr/short-duid). Except few convenience methods, they are both API compatible and can act as a drop-in replacement for each other.

### Installation
`npm install short-duid-js --save`

### How to use
This module is very simple to use, first you will need to initialize it and then start using its instance.

#### API

##### short_duid.init(shard_id, salt, epoch_start)
Instantiates short-duid and sets parameters for the life of instance.

###### Returns
- Short Distributed ID module instance or `Javascript Object` type
    - Initializes new instance of the module with the given parameters

###### Parameters
- `shard_id` - ID of this instance of short-duid, should be unique and not shared with other instances in the cluster; from 0 to 1023. This parameter will be converted into signed 32 bit integer and masked to fit in 12 bits.
- `salt` - Salt that is used by hashid encoder/decoder, should be constant and shared across all nodes in the cluster. Do not change this parameter once used in production, or you will have collisions in the alphanumeric IDs. Good way to generate salt on Linux: `dd if=/dev/random bs=1 count=102400 2>/dev/null| sha256sum`
- `epoch_start` - Number of **milliseconds** since unix epoch (1970, Jan 1 00:00:00 GMT). This should be some date in the near past and should never be changed further into the future once in production. Example: 1433116800000; //Mon, 01 Jun 2015 00:00:00 GMT. This parameter will be converted to unsigned 64bit integer.

____
##### _instance_.getDUID(count)
Method to retrieve array of DUIDs in alphanumeric form. Length of the array is specified by `count` parameter.

###### Returns
- `Javascript array` object of variable length, depending on `count` parameter.
    - Example: `[ "XLz0E3MvkEL" ]`

###### Parameters
- `count` - Number of alphanumeric DUIDs to return, from 0 to 8192.

____
##### _instance_.getDUIDInt(count)
Essential same method as `_instance_.getDUID` but instead of hashid converted integer, will return unique ID in a numeric form as string.

###### Returns
- `Javascript array` object of variable length, depending on `count` parameter.
    - Example: `[ "12534941854212112" ]`

###### Parameters
- `count` - Number of numeric DUIDs to return, from 0 to 8192.

____
##### _instance_.getShardID()
Method to get currently set shard ID of ShortDUID `_instance_`

###### Returns
- `number` current shard ID of ShortDUID `_instance_`
    - Example: `0`

###### Parameters
- `N/A`

____
##### _instance_.getEpochStart()
Method to get currently set custom epoch starting time in milliseconds of ShortDUID `_instance_`

###### Returns
- `string` currently set custom epoch of ShortDUID `_instance_`, since it is unsigned 64bit integer, we return it as string.
    - Example: `"0"`

###### Parameters
- `N/A`

____
##### _instance_.getSalt()
Method to get current salt of ShortDUID `_instance_`. Salt is used to generate alphanumeric DUIDs and also in `hashidEncode`/`hashidDecode` methods.

###### Returns
- `string` currently set salt that is used in hashid conversion of ShortDUID `_instance_`
    - Example: `"this is my salt"`

###### Parameters
- `N/A`

____
##### _instance_.hashidEncode(number_array)
Method to hash(encode) array of unsigned 64bit integers (in `Javascript string` format).

###### Returns
- `string` hashid of array of unsigned 64bit integers
    - Example: `"3nMMYV0PvMl"`

###### Parameters
- `number_array` - Array of unsigned 64bit integers in javascript number or string (if does not fit in `Javascript 58bit integer` data type) form.

____
##### _instance_.hashidDecode(hashid_string)
Decode previously encoded array of numbers with hashid method.

###### Returns
- `Javascript array` array of unsigned 64bit integers in a string form
    - Example: `['1', '2', '3']`

###### Parameters
- `hashid_string` - Hashid in a string form. Example: `3nMMYV0PvMl`

____
#### Advanced API
This API is mainly used by unit tests and should not be required for normal usage of the module. Use it at your own risk.

##### _instance_.getCurrentTimeMs()
Method to get current time since unix epoch in milliseconds as seen by the module, not adjusted for custom epoch. This method can be useful in testing and also in capturing _reference_ time to ensure timer stability across restarts.

###### Returns
- `string` of numbers, current time since unix epoch in milliseconds as seen by the module.

###### Parameters
- `N/A`

____
##### _instance_.driftTime(milliseconds)
Method to help simulate `system_clock` drift, can accept positive or negative integers.

###### Returns
- `string` number of milliseconds to drift ShortDUID's internal clock

###### Parameters
- `milliseconds` (optional) number of milliseconds to drift system_clock by, can be a positive or negative integer.


____
#### Example #1
Simplest example to execute all of the major methods of the module.
```javascript
var duid = require('short-duid-js');
var duid_instance = duid.init(0, "my salt", 0);
console.log(duid_instance.getDUID(10));
console.log(duid_instance.getDUIDInt(10));
```

#### Example #2
More complete example that will create API server with help of koajs and reply to queries.

##### package.json
```json
{
  "name": "ShortDUIDAPIServer",
  "description": "ShortDUID Example API Service",
  "version": "0.0.1",
  "private": true,
  "dependencies": {
    "koa": "*",
    "koa-bodyparser": "*",
    "koa-response-time": "*",
    "koa-router": "*",
    "koa-json": "*",
    "pm2": "*",
    "short-duid-js": "*"
  }
}
```

##### index.js
```javascript
'use strict';
var pm2 = require('pm2');

var cpus = require('os').cpus().length;
var procs = Math.ceil(0.75 * cpus);

pm2.connect(function() {
  pm2.start({
    name: 'ShortDUID',
    script: 'api_server.js',
    args: '',
    post_update: ['npm install --save', ' echo Launching ShortDUID'],
    node_args: ['--harmony', '--use_strict'],
    exec_interpreter: 'node',
    next_gen_js: false,
    exec_mode: 'cluster',
    min_uptime: '3600s',
    max_restarts: 25,
    cron_restart: '',
    instances: procs,
    max_memory_restart: '1G',
    error_file: './api_errors.log',
    out_file: './api_info.log',
    pid_file: './short-duid-api.pid',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    vizion: true,
    autorestart: true,
    port: 65000,
    env: {
      NODE_ENV: 'production',
      AWS_KEY: 'XXX',
      AWS_SECRET: 'XXX'
    }
  }, function(err, apps) {
    if (err) console.log("Error: ", err, "App:", apps);
    pm2.disconnect();
  });
});
```

##### api_server.js
```javascript
'use strict';
var koa = require('koa');
var router = require('koa-router')();
var app = module.exports = koa();
var duid = require('short-duid-js');

//Define app name and port for koa-cluster
var cpus = require('os').cpus().length;
app.name = "ShortDUID";
app.node_id = 0;
app.nid = process.env.NODE_APP_INSTANCE ? process.env.NODE_APP_INSTANCE : (process.pid % cpus); //nodejs instance ID
app.shard_id = app.node_id + app.nid;
app.port = 65000;
app.salt = "this is my super secret salt";
app.epoch_start = 1433116800 * 1000; //Mon, 01 Jun 2015 00:00:00 GMT

//Instantiate short-duid
var duid_instance = new duid.init(app.shard_id, app.salt, app.epoch_start);

//Setup routes
router
  .get('/', function*(next) {
    this.body = {
      name: 'ShortDUID API'
    };
  })
  .get('/nduid/:count?', function*(next) {
    this.body = yield(duid_instance.getDUIDInt((this.params.count ? this.params.count : 1)));
  })
  .get('/duid/:count?', function*(next) {
    this.body = yield(duid_instance.getDUID((this.params.count ? this.params.count : 1)));
  });

//Setup middleware
app
  .use(require('koa-json')())
  .use(require('koa-response-time')())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(app.port);
```

And then you should install application with `npm install --save` and start the server by `node index.js`. You can check the logs and also list the processes with `./node_modules/.bin/pm2 list`. Getting fresh id can be done by curl: `curl http://localhost:65000/duid/`.

#### More examples
For more examples please see  `examples` folder, which I plan to keep adding to. You are free to contribute more examples.

### Projects using ShortDUID
So far I know of none, if you are using it in your project and do not mind sharing this information, please drop me a note at <ian@phpb.com>, and I will add you to this list.

### Testing
`git clone https://gotfix.com/pixnr/short-duid-js.git && cd short-duid-js && npm install --save-dev` <br />
`npm test && npm run bench`
```
$ npm test

> short-duid@1.0.0 test /builds/pixnr/short-duid-js
> ./node_modules/mocha/bin/mocha --harmony --reporter spec ./test/



  Short DUID
    #getEpochStart()
      ✓ should return set epoch start, for instance #1: 1433116800000
      ✓ should return set epoch start, for instance #2: 1433116800000
      ✓ instance #1 and instance #2 should return same epoch start: 1433116800000
      ✓ should reset custom epoch to zero if given one larger than real epoch
      ✓ should accept custom epoch that is even 1 millisecond in the past
    #getSalt()
      ✓ should return set salt, for instance #1: 39622feb2b3e7aa7208f50f45ec36fd513baadad6977b53295a3b28aeaed4a54
      ✓ should return set salt, for instance #2: 39622feb2b3e7aa7208f50f45ec36fd513baadad6977b53295a3b28aeaed4a54
      ✓ instance #1 and instance #2 should return same salt: 39622feb2b3e7aa7208f50f45ec36fd513baadad6977b53295a3b28aeaed4a54
    #getShardID()
      ✓ should overflow if shard id is set to integer that does not fit in 10 bits: 1024 --> 0
      ✓ should overflow if shard id is set to integer that does not fit in 10 bits: 1025 --> 1
      ✓ should return set shard id for id that fits within 10 bits: 1023 --> 1023
      ✓ should return set shard id for id that fits within 10 bits: 0 --> 0
      ✓ should return set shard id for instance #1: 123
      ✓ should return set shard id for instance #2: 12
      ✓ should return different shard ids for instance #1 and instance #2
    #getDUID()
      ✓ Asked for 1 DUIDs, correctly returns 1 DUIDs
      ✓ Asked for 0 DUIDs, correctly returns 0 DUIDs
      ✓ Asked for 8192 DUIDs, correctly returns 8192 DUIDs (467ms)
      ✓ Asked for 8193 DUIDs, correctly returns 1 DUIDs
      ✓ should have no duplicates in the returned arrays, 8192 IDs each, and combined. (1162ms)
    #getDUIDInt()
      ✓ Asked for 1 Int DUIDs, correctly returns 1 Integer DUIDs
      ✓ Asked for 0 Int DUIDs, correctly returns 0 Integer DUIDs
      ✓ Asked for 8192 Int DUIDs, correctly returns 8192 Integer DUIDs (423ms)
      ✓ Asked for 8193 Int DUIDs, correctly returns 1 Integer DUIDs
      ✓ should have no duplicates in the returned arrays, 8192 IDs each, and combined. (133ms)
    DUID with drifting time
      ✓ should return same drift time as given as parameter
      ✓ should generate ID with -5890 millisecond drift into the past from now( 6012689289 ), 25219046593507329 should be numerically smaller than 25219071440564225
      ✓ should consistently generate unique IDs even when time is drifting backwards constantly (523ms)


  28 passing (3s)

$ cat /proc/cpuinfo | grep "^model name" | uniq
model name  : Intel(R) Xeon(R) CPU E5-2620 v3 @ 2.40GHz
$ npm run-script bench

> short-duid@1.0.0 bench /builds/pixnr/short-duid-js
> /usr/bin/env node benchmarks/test.js

single DUIDInt generation x 212,771 ops/sec ±6.31% (84 runs sampled)
batch of 10 DUIDInt generation x 22,137 ops/sec ±5.96% (91 runs sampled)
single DUID generation x 21,336 ops/sec ±3.27% (92 runs sampled)
batch of 10 DUID generation x 2,169 ops/sec ±3.11% (94 runs sampled)
single DUID generation (1 character salt) x 21,081 ops/sec ±3.84% (95 runs sampled)
batch of 10 DUID generation (1 character salt) x 2,118 ops/sec ±3.42% (92 runs sampled)

```
## TODO
- [ ] Improve performance, if possible
- [ ] Improve error handling, at the moment most of them are silent and prefer overflow
- [ ] Add more examples

## Contributing
All are welcome to submit pull requests and patches

## License

The MIT License (MIT)

Copyright (c) 2015 Ian Matyssik <ian@phpb.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
