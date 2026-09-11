require("dotenv").config()
const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const cookieParser = require("cookie-parser")
const session = require("express-session")

const errorHandler = require("./middlewares/errorHandling.middlewares")
const { passport } = require("./services/googleOAuth.service")

const userRoutes = require("./routes/user.routes")
const projectRoutes = require("./routes/project.routes")
const taskRoutes = require("./routes/task.routes")
const subTaskRoutes = require("./routes/subtask.routes")
const commentRoutes = require("./routes/comment.routes")
const notificationRoutes = require("./routes/notification.routes")
const aiRoutes = require("./routes/ai.routes")
const invitationRoutes = require("./routes/invitation.routes")
const morgan = require("morgan")

const app = express()

app.use(helmet())

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))
app.use(express.json())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}))
app.use(cookieParser())

app.use(passport.initialize())

if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
}

app.get("/api/health", (req, res) => {
    res.status(200).json({ success: true, message: "Server Is Healthy" })
})

app.use("/api/auth", userRoutes)
app.use("/api/projects", projectRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/subtasks", subTaskRoutes)
app.use("/api/comments", commentRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/ai", aiRoutes)
app.use("/api/invitations", invitationRoutes)

app.use(errorHandler)

module.exports = app
