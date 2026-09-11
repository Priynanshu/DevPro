const projectModel = require("../models/project.models")
const ApiError = require("../utils/ApiError")
const { getCache, setCache, deleteCache } = require("../utils/cache")
const { uploadImage } = require("../services/imageStore.service")

const createProject = async (req, res, next) => {
    try {
        const { projectName, projectKey, description, members, startDate, endDate, projectType, projectIcon, status } = req.body

        if (!projectName || !projectKey || !startDate || !endDate) {
            throw new ApiError("Please Fill All Fields", 400)
        }

        if (new Date(startDate) > new Date(endDate)) {
            throw new ApiError("Start Date Cannot Be After End Date", 400)
        }

        const existingProject = await projectModel.findOne({
            $or: [{ projectName }, { projectKey }]
        })

        if (existingProject) {
            const field = existingProject.projectName === projectName ? "name" : "key"
            throw new ApiError(`This Project ${field} Is Already Used`, 409)
        }

        const memberIds = Array.isArray(members) ? [...new Set([req.user.userId, ...members])] : [req.user.userId]

        const newProject = await projectModel.create({
            projectName,
            projectKey,
            description,
            projectLead: req.user.userId,
            members: memberIds,
            createdBy: req.user.userId,
            startDate,
            endDate,
            projectType,
            projectIcon,
            status
        })

        await deleteCache(`projects:user:*`)

        return res.status(201).json({
            message: "Project Created Successfully",
            success: true,
            project: newProject
        })

    } catch (error) {
        if (error.code === 11000) {
            return next(new ApiError("Project Name Or Key Already Exists", 409))
        }
        next(error)
    }
}

const getAllProjects = async (req, res, next) => {
    try {
        const cacheKey = `projects:user:${req.user.userId}`
        const cachedProjects = await getCache(cacheKey)

        if (cachedProjects) {
            return res.status(200).json({
                message: "Projects Fetched Successfully",
                success: true,
                count: cachedProjects.length,
                fromCache: true,
                projects: cachedProjects
            })
        }

        const projects = await projectModel.find({
            members: req.user.userId
        })
        .populate("projectLead", "username email profileImage")
        .populate("members", "username email profileImage")
        .sort({ createdAt: -1 })

        await setCache(cacheKey, projects, 60)

        return res.status(200).json({
            message: "Projects Fetched Successfully",
            success: true,
            count: projects.length,
            fromCache: false,
            projects
        })

    } catch (error) {
        next(error)
    }
}

const getProjectById = async (req, res, next) => {
    try {
        const { id } = req.params
        const cacheKey = `project:${id}`

        const cachedProject = await getCache(cacheKey)

        if (cachedProject) {
            const isMember = cachedProject.members.some(
                (member) => member._id.toString() === req.user.userId.toString()
            )

            if (!isMember) {
                throw new ApiError("You Do Not Have Access To This Project", 403)
            }

            return res.status(200).json({
                message: "Project Fetched Successfully",
                success: true,
                fromCache: true,
                project: cachedProject
            })
        }

        const project = await projectModel.findById(id)
            .populate("projectLead", "username email profileImage")
            .populate("members", "username email profileImage")
            .populate("createdBy", "username email")

        if (!project) {
            throw new ApiError("Project Not Found", 404)
        }

        const isMember = project.members.some(
            (member) => member._id.toString() === req.user.userId.toString()
        )

        if (!isMember) {
            throw new ApiError("You Do Not Have Access To This Project", 403)
        }

        await setCache(cacheKey, project, 60)

        return res.status(200).json({
            message: "Project Fetched Successfully",
            success: true,
            fromCache: false,
            project
        })

    } catch (error) {
        if (error.name === "CastError") {
            return next(new ApiError("Invalid Project Id", 400))
        }
        next(error)
    }
}

const updateProject = async (req, res, next) => {
    try {
        const { id } = req.params
        const { projectName, projectKey, description, members, startDate, endDate, projectType, projectIcon, status, columns } = req.body

        const project = await projectModel.findById(id)

        if (!project) {
            throw new ApiError("Project Not Found", 404)
        }

        if (project.projectLead.toString() !== req.user.userId.toString()) {
            throw new ApiError("Only Project Lead Can Update This Project", 403)
        }

        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            throw new ApiError("Start Date Cannot Be After End Date", 400)
        }

        if (projectName || projectKey) {
            const duplicate = await projectModel.findOne({
                _id: { $ne: id },
                $or: [{ projectName }, { projectKey }]
            })

            if (duplicate) {
                const field = duplicate.projectName === projectName ? "name" : "key"
                throw new ApiError(`This Project ${field} Is Already Used`, 409)
            }
        }

        if (projectName) project.projectName = projectName
        if (projectKey) project.projectKey = projectKey
        if (description !== undefined) project.description = description
        if (Array.isArray(members)) project.members = [...new Set([project.projectLead.toString(), ...members])]
        if (startDate) project.startDate = startDate
        if (endDate) project.endDate = endDate
        if (projectType) project.projectType = projectType
        if (projectIcon) project.projectIcon = projectIcon
        if (status) project.status = status
        if (Array.isArray(columns) && columns.length > 0) {
            project.columns = columns.map((column, index) => ({
                name: typeof column === "string" ? column : column.name,
                order: index
            }))
        }

        await project.save()

        await deleteCache(`project:${id}`)
        await deleteCache(`projects:user:*`)

        return res.status(200).json({
            message: "Project Updated Successfully",
            success: true,
            project
        })

    } catch (error) {
        if (error.name === "CastError") {
            return next(new ApiError("Invalid Project Id", 400))
        }
        if (error.code === 11000) {
            return next(new ApiError("Project Name Or Key Already Exists", 409))
        }
        next(error)
    }
}

const updateProjectIcon = async (req, res, next) => {
    try {
        const { id } = req.params

        if (!req.file) {
            throw new ApiError("No Image File Provided", 400)
        }

        const project = await projectModel.findById(id)

        if (!project) {
            throw new ApiError("Project Not Found", 404)
        }

        if (project.projectLead.toString() !== req.user.userId.toString()) {
            throw new ApiError("Only Project Lead Can Update This Project", 403)
        }

        const imageUrl = await uploadImage(req.file.buffer, req.file.originalname, "project-icons")
        project.projectIcon = imageUrl
        await project.save()

        await deleteCache(`project:${id}`)
        await deleteCache(`projects:user:*`)

        return res.status(200).json({
            message: "Project Icon Updated Successfully",
            success: true,
            project
        })

    } catch (error) {
        next(error)
    }
}

const deleteProject = async (req, res, next) => {
    try {
        const { id } = req.params

        const project = await projectModel.findById(id)

        if (!project) {
            throw new ApiError("Project Not Found", 404)
        }

        if (project.createdBy.toString() !== req.user.userId.toString()) {
            throw new ApiError("Only Project Creator Can Delete This Project", 403)
        }

        await projectModel.findByIdAndDelete(id)

        await deleteCache(`project:${id}`)
        await deleteCache(`projects:user:*`)

        return res.status(200).json({
            message: "Project Deleted Successfully",
            success: true
        })

    } catch (error) {
        if (error.name === "CastError") {
            return next(new ApiError("Invalid Project Id", 400))
        }
        next(error)
    }
}

module.exports = {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    updateProjectIcon,
    deleteProject
}
