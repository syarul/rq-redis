/**
 * 
 * @param {*} query 
 * @param {*} modelOptions 
 * @returns 
 */
const rqRedis = (query, { rq, redis, redisKey, memberKey, options = {} }) => rq(query, {
  methods: {
    get: 'get,id',
    find: 'find,query',
    create: 'create,data|title', // added a custom key
    update: 'update,id|data|title', // split parameters options
    getMemberKeys: 'getMemberKeys',
    all: 'all,keys',
    remove: 'remove,id|title',
    ...(options.methods ? options.methods : {})
  },
  config: (param) => {
    const redisMethods = {
      get ({ id }) {
        return redis.hgetall(`${redisKey}:${id}`)
      },
      async find ({ query }) {
        const [[title, value]] = Object.entries(query)
        for (const id of (await redis.smembers(memberKey))) {
          const check = (await redis.hget(`${redisKey}:${id}`, title) === value)
          if (check) {
            return redisMethods.get({ id })
          }
        }
      },
      async create ({ data }) {
        const [, ...secondaryKeys] = [].slice.call(arguments).pop()
        // get current SADD keys
        const currentKeys = (await redis.smembers(memberKey)).sort()
        let nextKey = '0'
        if (currentKeys.length) {
          nextKey = `${parseInt(currentKeys.pop()) + 1}`
        }

        // use SADD to add each object's ID to a set
        await redis.sadd(memberKey, nextKey)

        // Use SADD to add separate set for all secondary indexing
        for (const secondaryKey of secondaryKeys) {
          await redis.sadd(secondaryKey, data[secondaryKey])
        }

        // store the object separately in a Redis hash
        await redis.hmset(`${redisKey}:${nextKey}`, data)

        // fetch the object using the objectKey
        return redis.hgetall(`${redisKey}:${nextKey}`)
      },
      async update ({ id, data }) {
        const [,, ...secondaryKeys] = [].slice.call(arguments).pop()
        const oldData = await redisMethods.get({ id })
        const newData = { ...oldData, ...data }
        await redis.hmset(`${redisKey}:${id}`, newData)

        // also update all secondary keys with SREM/SADD
        for (const secondaryKey of secondaryKeys) {
          await redis.srem(secondaryKey, oldData[secondaryKey])
          await redis.sadd(secondaryKey, data[secondaryKey])
        }
        return newData
      },
      async getMemberKeys () {
        return { keys: await redis.smembers(memberKey) }
      },
      async all ({ keys }){
        return Promise.all(keys.map(id => redisMethods.get({ id })))
      },
      async remove ({ id }) {
        const [, ...secondaryKeys] = [].slice.call(arguments).pop()
        // remove all secondary key first
        const data = await redisMethods.get({ id })
        for (const key of secondaryKeys) {
          await redis.srem(key, data[key])
        }
        try {
          // delete the hash using the DEL command
          await redis.del(`${redisKey}:${id}`)
          // remove related member key
          await redis.srem(memberKey, id)
        } catch (error) {
          console.error('Error removing HMSET:', error)
        }
      },
      ...(options.config ? options.config : {})
    }
    return (redisMethods)[param]
  }
})

exports.rqRedis = rqRedis
module.exports = rqRedis
module.exports.default = rqRedis
