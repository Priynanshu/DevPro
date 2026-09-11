const express = require("express")
const routes = express.Router()
const authMiddleware = require("../middlewares/auth.middlewares")
const notificationController = require("../controllers/notification.controller")

routes.get("/all", authMiddleware.identifyUser, notificationController.getMyNotifications)
routes.put("/read/:id", authMiddleware.identifyUser, notificationController.markAsRead)
routes.put("/read-all", authMiddleware.identifyUser, notificationController.markAllAsRead)
routes.delete("/delete/:id", authMiddleware.identifyUser, notificationController.deleteNotification)

module.exports = routes
