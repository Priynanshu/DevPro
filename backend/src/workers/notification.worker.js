require("dotenv").config()
const { Worker } = require("bullmq")
const connection = require("../config/queue")
const connectDB = require("../config/database")
const notificationModel = require("../models/notification.models")
const userModel = require("../models/user.models")
const { sendEmail } = require("../services/email.service")
const { taskAssignedTemplate } = require("../utils/emailTemplates")

connectDB()

const notificationWorker = new Worker("notifications", async (job) => {
    const { recipient, sender, type, message, task, project, projectName, taskTitle } = job.data

    await notificationModel.create({
        recipient,
        sender,
        type,
        message,
        task,
        project
    })

    if (type === "task_assigned" || type === "status_changed") {
        try {
            const recipientUser = await userModel.findById(recipient)

            if (recipientUser) {
                await sendEmail({
                    to: recipientUser.email,
                    subject: `DevPro: ${message}`,
                    html: taskAssignedTemplate({
                        assigneeName: recipientUser.username,
                        taskTitle: taskTitle || message,
                        projectName: projectName || "your project",
                        taskUrl: `${process.env.CLIENT_URL}/dashboard/projects/${project}`
                    })
                })
            }
        } catch (error) {
            console.log("Notification Email Failed:", error.message)
        }
    }

}, { connection })

notificationWorker.on("completed", (job) => {
    console.log(`Notification Job ${job.id} Completed`)
})

notificationWorker.on("failed", (job, err) => {
    console.log(`Notification Job ${job.id} Failed: `, err.message)
})

console.log("Notification Worker Started")
