const redis = require("../config/redis")

const getCache = async (key) => {
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
}

const setCache = async (key, value, ttlInSeconds = 60) => {
    await redis.set(key, JSON.stringify(value), "EX", ttlInSeconds)
}

const deleteCache = async (keyPattern) => {
    const keys = await redis.keys(keyPattern)
    if (keys.length > 0) {
        await redis.del(keys)
    }
}

module.exports = { getCache, setCache, deleteCache }
