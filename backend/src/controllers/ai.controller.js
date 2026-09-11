const { generateAIContent } = require("../services/ai.service")
const taskModel = require("../models/task.models")
const commentModel = require("../models/comment.models")
const ApiError = require("../utils/ApiError")

const generateProjectDescription = async (req, res, next) => {
    try {
        const { projectName, projectType } = req.body

        if (!projectName) {
            throw new ApiError("Project Name Is Required", 400)
        }

        const prompt = `Write a short, professional 2-3 sentence project description for a software project named "${projectName}"${projectType ? ` of type "${projectType}"` : ""}. Only return the description text, nothing else.`

        const description = await generateAIContent(prompt)

        return res.status(200).json({
            success: true,
            message: "Description Generated Successfully",
            description
        })

    } catch (error) {
        next(error)
    }
}

const generateTaskSuggestions = async (req, res, next) => {
    try {
        const { projectName, goal } = req.body

        if (!goal) {
            throw new ApiError("A Project Goal Is Required", 400)
        }

        const prompt = `Based on this goal for a project called "${projectName || "the project"}": "${goal}", suggest 5 concrete actionable task titles, one per line, no numbering, no extra text.`

        const result = await generateAIContent(prompt)
        const tasks = result.split("\n").map((line) => line.replace(/^[-*\d.]+\s*/, "").trim()).filter(Boolean)

        return res.status(200).json({
            success: true,
            message: "Tasks Generated Successfully",
            tasks
        })

    } catch (error) {
        next(error)
    }
}

const summarizeTask = async (req, res, next) => {
    try {
        const { taskId } = req.params

        const task = await taskModel.findById(taskId)

        if (!task) {
            throw new ApiError("Task Not Found", 404)
        }

        const comments = await commentModel.find({ task: taskId }).populate("author", "username").sort({ createdAt: 1 })

        const commentText = comments.map((comment) => `${comment.author.username}: ${comment.text}`).join("\n")

        const prompt = `Summarize the current state of this task in 2-3 sentences for a busy team lead.\n\nTitle: ${task.title}\nDescription: ${task.description || "No Description"}\nStatus: ${task.status}\nPriority: ${task.priority}\nComments:\n${commentText || "No Comments Yet"}\n\nOnly return the summary text.`

        const summary = await generateAIContent(prompt)

        return res.status(200).json({
            success: true,
            message: "Task Summarized Successfully",
            summary
        })

    } catch (error) {
        next(error)
    }
}

const suggestPriority = async (req, res, next) => {
    try {
        const { title, description, dueDate } = req.body

        if (!title) {
            throw new ApiError("Task Title Is Required", 400)
        }

        const prompt = `Given this task, suggest ONE priority level from exactly these options: critical, high, medium, low. Only return the single word.\n\nTitle: ${title}\nDescription: ${description || "None"}\nDue Date: ${dueDate || "None"}`

        const result = await generateAIContent(prompt)
        const priority = result.toLowerCase().replace(/[^a-z]/g, "")
        const validPriorities = ["critical", "high", "medium", "low"]

        return res.status(200).json({
            success: true,
            message: "Priority Suggested Successfully",
            priority: validPriorities.includes(priority) ? priority : "medium"
        })

    } catch (error) {
        next(error)
    }
}

module.exports = { generateProjectDescription, generateTaskSuggestions, summarizeTask, suggestPriority }
