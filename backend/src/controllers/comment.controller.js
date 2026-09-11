const commentModel = require("../models/comment.models")
const taskModel = require("../models/task.models")
const projectModel = require("../models/project.models")
const ApiError = require("../utils/ApiError")
const { queueNotification } = require("../services/notificationQueue.service")

const createComment = async (req, res, next) => {
    try {
        const { taskId } = req.params
        const { text } = req.body

        if (!text || !text.trim()) {
            throw new ApiError("Comment Text Is Required", 400)
        }

        const task = await taskModel.findById(taskId)

        if (!task) {
            throw new ApiError("Task Not Found", 404)
        }

        const project = await projectModel.findById(task.project)

        const isMember = project.members.some((member) => member.toString() === req.user.userId.toString())

        if (!isMember) {
            throw new ApiError("You Do Not Have Access To This Task", 403)
        }

        const comment = await commentModel.create({
            task: taskId,
            author: req.user.userId,
            text: text.trim()
        })

        if (task.assignTo && task.assignTo.toString() !== req.user.userId.toString()) {
            await queueNotification({
                recipient: task.assignTo,
                sender: req.user.userId,
                type: "comment_added",
                message: `New Comment On Task: ${task.title}`,
                task: task._id,
                project: task.project
            })
        }

        const populatedComment = await comment.populate("author", "username email profileImage")

        return res.status(201).json({
            success: true,
            message: "Comment Added Successfully",
            comment: populatedComment
        })

    } catch (error) {
        next(error)
    }
}

const getCommentsByTask = async (req, res, next) => {
    try {
        const { taskId } = req.params

        const comments = await commentModel.find({ task: taskId })
            .populate("author", "username email profileImage")
            .sort({ createdAt: 1 })

        return res.status(200).json({
            success: true,
            message: "Comments Fetched Successfully",
            count: comments.length,
            comments
        })

    } catch (error) {
        next(error)
    }
}

const deleteComment = async (req, res, next) => {
    try {
        const { id } = req.params

        const comment = await commentModel.findById(id)

        if (!comment) {
            throw new ApiError("Comment Not Found", 404)
        }

        if (comment.author.toString() !== req.user.userId.toString()) {
            throw new ApiError("You Can Only Delete Your Own Comments", 403)
        }

        await commentModel.findByIdAndDelete(id)

        return res.status(200).json({
            success: true,
            message: "Comment Deleted Successfully"
        })

    } catch (error) {
        if (error.name === "CastError") {
            return next(new ApiError("Invalid Comment Id", 400))
        }
        next(error)
    }
}

module.exports = { createComment, getCommentsByTask, deleteComment }
