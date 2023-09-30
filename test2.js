const rqRedis = require('./index')
const rq = require('requrse')
const Redis = require('ioredis')
require('dotenv').config()

const redis = new Redis(`rediss://default:${process.env.REDIS_KEY}@willing-cowbird-38871.upstash.io:38871`)

const redisKey = 'todos'
const memberKey = 'todo_ids'

const modelOptions = {
  rq, redis, redisKey, memberKey
}

rqRedis({
    todo: {
      getMemberKeys: {
        all: {
          id: 1,
          text: 1
        }
      },
    }
}, modelOptions).then(r => console.log(JSON.stringify(r)), console.error)