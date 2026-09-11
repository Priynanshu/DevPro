const express = require("express")
const routes = express.Router()
const authMiddleware = require("../middlewares/auth.middlewares")
const aiController = require("../controllers/ai.controller")

routes.post("/project-description", authMiddleware.identifyUser, aiController.generateProjectDescription)
routes.post("/task-suggestions", authMiddleware.identifyUser, aiController.generateTaskSuggestions)
routes.get("/summarize/:taskId", authMiddleware.identifyUser, aiController.summarizeTask)
routes.post("/suggest-priority", authMiddleware.identifyUser, aiController.suggestPriority)

module.exports = routes
