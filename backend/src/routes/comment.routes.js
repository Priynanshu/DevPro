const express = require("express")
const routes = express.Router()
const authMiddleware = require("../middlewares/auth.middlewares")
const commentController = require("../controllers/comment.controller")

routes.post("/task/:taskId/create", authMiddleware.identifyUser, commentController.createComment)
routes.get("/task/:taskId/all", authMiddleware.identifyUser, commentController.getCommentsByTask)
routes.delete("/delete/:id", authMiddleware.identifyUser, commentController.deleteComment)

module.exports = routes
