const subTaskModel = require("../models/subTask.models")
const taskModel = require("../models/task.models")
const projectModel = require("../models/project.models")
const ApiError = require("../utils/ApiError")
const { deleteCache } = require("../utils/cache")
const { queueNotification } = require("../services/notificationQueue.service")

const checkTaskAccess = async (taskId, userId) => {
    const task = await taskModel.findById(taskId)

    if (!task) {
        throw new ApiError("Task Not Found", 404)
    }

    const project = await projectModel.findById(task.project)

    const isMember = project.members.some((member) => member.toString() === userId.toString())

    if (!isMember) {
        throw new ApiError("You Do Not Have Access To This Task", 403)
    }

    return task
}

const createSubTask = async (req, res, next) => {
    try {
        const { taskId } = req.params
        const { title, description, assignTo, priority, dueDate } = req.body

        if (!title) {
            throw new ApiError("SubTask Title Is Required", 400)
        }

        const task = await checkTaskAccess(taskId, req.user.userId)

        const subTask = await subTaskModel.create({
            task: taskId,
            title,
            description,
            assignTo,
            priority,
            dueDate
        })

        task.subtasks.push(subTask._id)
        await task.save()

        await deleteCache(`tasks:project:${task.project}*`)

        if (assignTo && assignTo.toString() !== req.user.userId.toString()) {
            const project = await projectModel.findById(task.project)
            await queueNotification({
                recipient: assignTo,
                sender: req.user.userId,
                type: "task_assigned",
                message: `You Have Been Assigned A SubTask: ${title}`,
                task: task._id,
                project: task.project,
                projectName: project?.projectName,
                taskTitle: title
            })
        }

        return res.status(201).json({
            success: true,
            message: "SubTask Created Successfully",
            subTask
        })

    } catch (error) {
        next(error)
    }
}

const getSubTasksByTask = async (req, res, next) => {
    try {
        const { taskId } = req.params

        await checkTaskAccess(taskId, req.user.userId)

        const subTasks = await subTaskModel.find({ task: taskId })
            .populate("assignTo", "username email profileImage")
            .sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            message: "SubTasks Fetched Successfully",
            count: subTasks.length,
            subTasks
        })

    } catch (error) {
        next(error)
    }
}

const updateSubTask = async (req, res, next) => {
    try {
        const { id } = req.params
        const { title, description, assignTo, priority, dueDate, status } = req.body

        const subTask = await subTaskModel.findById(id)

        if (!subTask) {
            throw new ApiError("SubTask Not Found", 404)
        }

        await checkTaskAccess(subTask.task, req.user.userId)

        if (title) subTask.title = title
        if (description) subTask.description = description
        if (assignTo) subTask.assignTo = assignTo
        if (priority) subTask.priority = priority
        if (dueDate) subTask.dueDate = dueDate
        if (status) subTask.status = status

        await subTask.save()

        return res.status(200).json({
            success: true,
            message: "SubTask Updated Successfully",
            subTask
        })

    } catch (error) {
        if (error.name === "CastError") {
            return next(new ApiError("Invalid SubTask Id", 400))
        }
        next(error)
    }
}

const deleteSubTask = async (req, res, next) => {
    try {
        const { id } = req.params

        const subTask = await subTaskModel.findById(id)

        if (!subTask) {
            throw new ApiError("SubTask Not Found", 404)
        }

        const task = await checkTaskAccess(subTask.task, req.user.userId)

        await subTaskModel.findByIdAndDelete(id)
        await taskModel.findByIdAndUpdate(task._id, { $pull: { subtasks: id } })

        return res.status(200).json({
            success: true,
            message: "SubTask Deleted Successfully"
        })

    } catch (error) {
        if (error.name === "CastError") {
            return next(new ApiError("Invalid SubTask Id", 400))
        }
        next(error)
    }
}

module.exports = { createSubTask, getSubTasksByTask, updateSubTask, deleteSubTask }
