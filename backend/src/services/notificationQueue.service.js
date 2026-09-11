const { Queue } = require("bullmq")
const connection = require("../config/queue")

const notificationQueue = new Queue("notifications", { connection })

const queueNotification = async (payload) => {
    await notificationQueue.add("send-notification", payload, {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: true,
        removeOnFail: false
    })
}

module.exports = { notificationQueue, queueNotification }
