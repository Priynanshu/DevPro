const Redis = require("ioredis")

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
})

redis.on("connect", () => {
    console.log("Redis Connected Successfully")
})

redis.on("error", (err) => {
    console.log("Error From Redis Connection: ", err)
})

module.exports = redis
