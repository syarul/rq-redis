const rqRedis = require('./index')
const rq = require('requrse')
const Redis = require('ioredis')
require('dotenv').config()

const redis = new Redis(`rediss://default:${process.env.REDIS_KEY}@willing-cowbird-38871.upstash.io:38871`)

const redisKey = 'todos'
const memberKey = 'todo_ids'

const modelOptions = {
  rq, redis, redisKey, memberKey, options: {
    methods: {}, // new methods
    config: {} // new config
  }
}

rqRedis({
    book: {
      getMemberKeys: '*'
    }
}, modelOptions).then(console.log, console.error)