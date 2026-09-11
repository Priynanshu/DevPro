const express = require("express")
const routes = express.Router()
const authMiddleware = require("../middlewares/auth.middlewares")
const subTaskController = require("../controllers/subtask.controller")

routes.post("/task/:taskId/create", authMiddleware.identifyUser, subTaskController.createSubTask)
routes.get("/task/:taskId/all", authMiddleware.identifyUser, subTaskController.getSubTasksByTask)
routes.put("/edit/:id", authMiddleware.identifyUser, subTaskController.updateSubTask)
routes.delete("/delete/:id", authMiddleware.identifyUser, subTaskController.deleteSubTask)

module.exports = routes
