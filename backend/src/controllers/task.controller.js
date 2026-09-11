const taskModel = require("../models/task.models")
const projectModel = require("../models/project.models")
const subTaskModel = require("../models/subTask.models")
const ApiError = require("../utils/ApiError")
const { getCache, setCache, deleteCache } = require("../utils/cache")
const { queueNotification } = require("../services/notificationQueue.service")
const { uploadImage } = require("../services/imageStore.service")

const checkProjectMembership = async (projectId, userId) => {
    const project = await projectModel.findById(projectId)

    if (!project) {
        throw new ApiError("Project Not Found", 404)
    }

    const isMember = project.members.some((member) => member.toString() === userId.toString())

    if (!isMember) {
        throw new ApiError("You Do Not Have Access To This Project", 403)
    }

    return project
}

const isProjectLead = (project, userId) => project.projectLead.toString() === userId.toString()

const createTask = async (req, res, next) => {
    try {
        const { projectId } = req.params
        const { title, description, assignTo, labels, priority, dueDate } = req.body

        if (!title) {
            throw new ApiError("Task Title Is Required", 400)
        }

        const project = await checkProjectMembership(projectId, req.user.userId)

        if (assignTo && !isProjectLead(project, req.user.userId)) {
            throw new ApiError("Only The Project Lead Can Assign Tasks", 403)
        }

        const task = await taskModel.create({
            project: projectId,
            title,
            description,
            assignTo,
            labels,
            priority,
            dueDate
        })

        await deleteCache(`tasks:project:${projectId}*`)

        if (assignTo && assignTo.toString() !== req.user.userId.toString()) {
            await queueNotification({
                recipient: assignTo,
                sender: req.user.userId,
                type: "task_assigned",
                message: `You Have Been Assigned A New Task: ${title}`,
                task: task._id,
                project: projectId,
                projectName: project.projectName,
                taskTitle: title
            })
        }

        return res.status(201).json({
            success: true,
            message: "Task Created Successfully",
            task
        })

    } catch (error) {
        next(error)
    }
}

const getTasksByProject = async (req, res, next) => {
    try {
        const { projectId } = req.params
        const { status, priority, assignTo } = req.query

        await checkProjectMembership(projectId, req.user.userId)

        const filterKey = `${status || "all"}:${priority || "all"}:${assignTo || "all"}`
        const cacheKey = `tasks:project:${projectId}:${filterKey}`

        const cachedTasks = await getCache(cacheKey)
        if (cachedTasks) {
            return res.status(200).json({
                success: true,
                message: "Tasks Fetched Successfully",
                count: cachedTasks.length,
                fromCache: true,
                tasks: cachedTasks
            })
        }

        const filter = { project: projectId }
        if (status) filter.status = status
        if (priority) filter.priority = priority
        if (assignTo) filter.assignTo = assignTo

        const tasks = await taskModel.find(filter)
            .populate("assignTo", "username email profileImage")
            .populate("subtasks")
            .sort({ createdAt: -1 })

        await setCache(cacheKey, tasks, 30)

        return res.status(200).json({
            success: true,
            message: "Tasks Fetched Successfully",
            count: tasks.length,
            fromCache: false,
            tasks
        })

    } catch (error) {
        next(error)
    }
}

const getTaskById = async (req, res, next) => {
    try {
        const { id } = req.params

        const task = await taskModel.findById(id)
            .populate("assignTo", "username email profileImage")
            .populate("subtasks")

        if (!task) {
            throw new ApiError("Task Not Found", 404)
        }

        await checkProjectMembership(task.project, req.user.userId)

        return res.status(200).json({
            success: true,
            message: "Task Fetched Successfully",
            task
        })

    } catch (error) {
        if (error.name === "CastError") {
            return next(new ApiError("Invalid Task Id", 400))
        }
        next(error)
    }
}

const updateTask = async (req, res, next) => {
    try {
        const { id } = req.params
        const { title, description, assignTo, labels, priority, dueDate, status } = req.body

        const task = await taskModel.findById(id)

        if (!task) {
            throw new ApiError("Task Not Found", 404)
        }

        const project = await checkProjectMembership(task.project, req.user.userId)
        const userIsLead = isProjectLead(project, req.user.userId)

        if (assignTo !== undefined && !userIsLead) {
            throw new ApiError("Only The Project Lead Can Assign Tasks", 403)
        }

        // A task can only move into a "Done" style column once every one of its
        // subtasks is marked Done — this keeps the board honest about real progress.
        if (status && status.toLowerCase() === "done") {
            const subtasks = await subTaskModel.find({ task: id })
            const hasIncomplete = subtasks.some((subtask) => subtask.status !== "Done")

            if (hasIncomplete) {
                throw new ApiError("Complete All Subtasks Before Marking This Task As Done", 400)
            }
        }

        const previousAssignee = task.assignTo ? task.assignTo.toString() : null
        const previousStatus = task.status

        if (title) task.title = title
        if (description) task.description = description
        if (assignTo !== undefined) task.assignTo = assignTo || null
        if (Array.isArray(labels)) task.labels = labels
        if (priority) task.priority = priority
        if (dueDate) task.dueDate = dueDate
        if (status) task.status = status

        await task.save()

        await deleteCache(`tasks:project:${task.project}*`)

        if (assignTo && assignTo.toString() !== previousAssignee && assignTo.toString() !== req.user.userId.toString()) {
            await queueNotification({
                recipient: assignTo,
                sender: req.user.userId,
                type: "task_assigned",
                message: `You Have Been Assigned To Task: ${task.title}`,
                task: task._id,
                project: task.project,
                projectName: project.projectName,
                taskTitle: task.title
            })
        }

        if (status && status !== previousStatus && task.assignTo && task.assignTo.toString() !== req.user.userId.toString()) {
            await queueNotification({
                recipient: task.assignTo,
                sender: req.user.userId,
                type: "status_changed",
                message: `Task "${task.title}" Status Changed To ${status}`,
                task: task._id,
                project: task.project,
                projectName: project.projectName,
                taskTitle: task.title
            })
        }

        return res.status(200).json({
            success: true,
            message: "Task Updated Successfully",
            task
        })

    } catch (error) {
        if (error.name === "CastError") {
            return next(new ApiError("Invalid Task Id", 400))
        }
        next(error)
    }
}

const addTaskAttachment = async (req, res, next) => {
    try {
        const { id } = req.params

        if (!req.file) {
            throw new ApiError("No File Provided", 400)
        }

        const task = await taskModel.findById(id)

        if (!task) {
            throw new ApiError("Task Not Found", 404)
        }

        await checkProjectMembership(task.project, req.user.userId)

        const fileUrl = await uploadImage(req.file.buffer, req.file.originalname, "task-attachments")
        task.attachments.push(fileUrl)
        await task.save()

        await deleteCache(`tasks:project:${task.project}*`)

        return res.status(200).json({
            success: true,
            message: "Attachment Added Successfully",
            task
        })

    } catch (error) {
        next(error)
    }
}

const deleteTask = async (req, res, next) => {
    try {
        const { id } = req.params

        const task = await taskModel.findById(id)

        if (!task) {
            throw new ApiError("Task Not Found", 404)
        }

        const project = await checkProjectMembership(task.project, req.user.userId)

        if (!isProjectLead(project, req.user.userId)) {
            throw new ApiError("Only Project Lead Can Delete Tasks", 403)
        }

        await taskModel.findByIdAndDelete(id)

        await deleteCache(`tasks:project:${task.project}*`)

        return res.status(200).json({
            success: true,
            message: "Task Deleted Successfully"
        })

    } catch (error) {
        if (error.name === "CastError") {
            return next(new ApiError("Invalid Task Id", 400))
        }
        next(error)
    }
}

// All tasks assigned to the logged-in user, across every project they're in.
const getMyAssignedTasks = async (req, res, next) => {
    try {
        const tasks = await taskModel.find({ assignTo: req.user.userId })
            .populate("project", "projectName projectKey projectIcon")
            .sort({ dueDate: 1 })

        return res.status(200).json({
            success: true,
            message: "Assigned Tasks Fetched Successfully",
            count: tasks.length,
            tasks
        })

    } catch (error) {
        next(error)
    }
}

// For a project lead: every task they've handed out, grouped by assignee,
// across every project they lead.
const getTasksAssignedByMe = async (req, res, next) => {
    try {
        const ledProjects = await projectModel.find({ projectLead: req.user.userId }).select("_id projectName projectKey")

        const ledProjectIds = ledProjects.map((project) => project._id)

        const tasks = await taskModel.find({
            project: { $in: ledProjectIds },
            assignTo: { $ne: null }
        })
            .populate("assignTo", "username email profileImage")
            .populate("project", "projectName projectKey")
            .sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            message: "Assigned Tasks Fetched Successfully",
            count: tasks.length,
            isLeadOfAnyProject: ledProjectIds.length > 0,
            tasks
        })

    } catch (error) {
        next(error)
    }
}

const removeTaskAttachment = async (req, res, next) => {
    try {
        const { id } = req.params
        const { url } = req.body

        if (!url) {
            throw new ApiError("Attachment URL Is Required", 400)
        }

        const task = await taskModel.findById(id)

        if (!task) {
            throw new ApiError("Task Not Found", 404)
        }

        await checkProjectMembership(task.project, req.user.userId)

        task.attachments = task.attachments.filter((attachment) => attachment !== url)
        await task.save()

        await deleteCache(`tasks:project:${task.project}*`)

        return res.status(200).json({
            success: true,
            message: "Attachment Removed Successfully",
            task
        })

    } catch (error) {
        next(error)
    }
}

module.exports = {
    createTask,
    getTasksByProject,
    getTaskById,
    updateTask,
    addTaskAttachment,
    removeTaskAttachment,
    deleteTask,
    getMyAssignedTasks,
    getTasksAssignedByMe
}
