const nodemailer = require("nodemailer")

const isEmailConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)

let transporter = null

if (isEmailConfigured) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    })
} else {
    console.log("Email Not Configured — Set SMTP_HOST, SMTP_USER And SMTP_PASS In .env To Send Real Emails")
}

const sendEmail = async ({ to, subject, html }) => {
    if (!isEmailConfigured) {
        return false
    }

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.SMTP_USER,
            to,
            subject,
            html
        })
        return true
    } catch (error) {
        console.log("Email Send Failed:", error.message)
        return false
    }
}

module.exports = { sendEmail, isEmailConfigured }
