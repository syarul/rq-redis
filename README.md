# rq-redis
reQurse middleware plugin for redis.


## usage
methods:-
- get
- find
- create
- update
- getMemberKeys
- remove

```js
const rqRedis = require('rq-redis')
const rq = require('requrse')
const Redis = require('ioredis')
require('dotenv').config()

const redis = new Redis(`rediss://default:${process.env.REDIS_KEY}@willing-cowbird-38871.upstash.io:38871`)

const redisKey = 'books'
const memberKey = 'books_ids'

const modelOptions = {
  rq, redis, redisKey, memberKey, options: {
    methods: {}, // new methods
    config: {} // new config
  }
}

rqRedis({
    book: {
      create: {
        $params: {
          data: {
            title: 'Foundation',
            genre: 'Science Fiction'
          },
          title: 1 // this will be used as secondary key
        },
        title: 1
      }
    }
}, modelOptions).then(r => {
  console.log(r) // { book: { create: { title: 'Foundation' } } }
  redis.disconnect()
}, console.error)

```