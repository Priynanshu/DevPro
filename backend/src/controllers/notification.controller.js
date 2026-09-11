const notificationModel = require("../models/notification.models")
const ApiError = require("../utils/ApiError")

const getMyNotifications = async (req, res, next) => {
    try {
        const notifications = await notificationModel.find({ recipient: req.user.userId })
            .populate("sender", "username profileImage")
            .populate("task", "title")
            .populate("project", "projectName")
            .populate("invitation", "status")
            .sort({ createdAt: -1 })
            .limit(50)

        const unreadCount = notifications.filter((notification) => !notification.isRead).length

        return res.status(200).json({
            success: true,
            message: "Notifications Fetched Successfully",
            unreadCount,
            notifications
        })

    } catch (error) {
        next(error)
    }
}

const markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params

        const notification = await notificationModel.findById(id)

        if (!notification) {
            throw new ApiError("Notification Not Found", 404)
        }

        if (notification.recipient.toString() !== req.user.userId.toString()) {
            throw new ApiError("You Do Not Have Access To This Notification", 403)
        }

        notification.isRead = true
        await notification.save()

        return res.status(200).json({
            success: true,
            message: "Notification Marked As Read",
            notification
        })

    } catch (error) {
        if (error.name === "CastError") {
            return next(new ApiError("Invalid Notification Id", 400))
        }
        next(error)
    }
}

const markAllAsRead = async (req, res, next) => {
    try {
        await notificationModel.updateMany(
            { recipient: req.user.userId, isRead: false },
            { isRead: true }
        )

        return res.status(200).json({
            success: true,
            message: "All Notifications Marked As Read"
        })

    } catch (error) {
        next(error)
    }
}

const deleteNotification = async (req, res, next) => {
    try {
        const { id } = req.params

        const notification = await notificationModel.findById(id)

        if (!notification) {
            throw new ApiError("Notification Not Found", 404)
        }

        if (notification.recipient.toString() !== req.user.userId.toString()) {
            throw new ApiError("You Do Not Have Access To This Notification", 403)
        }

        await notificationModel.findByIdAndDelete(id)

        return res.status(200).json({
            success: true,
            message: "Notification Deleted Successfully"
        })

    } catch (error) {
        if (error.name === "CastError") {
            return next(new ApiError("Invalid Notification Id", 400))
        }
        next(error)
    }
}

module.exports = { getMyNotifications, markAsRead, markAllAsRead, deleteNotification }
