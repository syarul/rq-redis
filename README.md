# rq-redis
requrse middleware plugins for redis


## usage

```js
const rqRedis = require('rq-redis')
const rq = require('requrse')

const redis = new Redis('rediss://<redis_path>:37907')

const redisKey = 'books'
const memberKey = 'books_ids'

const modelOptions = {
  rq, redis, redisKey, memberKey
}

const books = await rqRedis({
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
}, modelOptions)

```