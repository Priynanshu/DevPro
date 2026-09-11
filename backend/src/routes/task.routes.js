const express = require("express")
const routes = express.Router()
const authMiddleware = require("../middlewares/auth.middlewares")
const upload = require("../middlewares/upload.middlewares")
const taskController = require("../controllers/task.controller")

routes.post("/project/:projectId/create", authMiddleware.identifyUser, taskController.createTask)
routes.get("/project/:projectId/all", authMiddleware.identifyUser, taskController.getTasksByProject)
routes.get("/my-assigned", authMiddleware.identifyUser, taskController.getMyAssignedTasks)
routes.get("/assigned-by-me", authMiddleware.identifyUser, taskController.getTasksAssignedByMe)
routes.get("/:id", authMiddleware.identifyUser, taskController.getTaskById)
routes.put("/edit/:id", authMiddleware.identifyUser, taskController.updateTask)
routes.put("/attachment/:id", authMiddleware.identifyUser, upload.single("file"), taskController.addTaskAttachment)
routes.delete("/attachment/:id", authMiddleware.identifyUser, taskController.removeTaskAttachment)
routes.delete("/delete/:id", authMiddleware.identifyUser, taskController.deleteTask)

module.exports = routes
