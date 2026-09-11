const express = require("express")
const routes = express.Router()
const authMiddleware = require("../middlewares/auth.middlewares")
const upload = require("../middlewares/upload.middlewares")
const projectController = require("../controllers/project.controller")

routes.post("/create-project", authMiddleware.identifyUser, projectController.createProject)
routes.get("/all-projects", authMiddleware.identifyUser, projectController.getAllProjects)
routes.get("/project/:id", authMiddleware.identifyUser, projectController.getProjectById)
routes.put("/edit/:id", authMiddleware.identifyUser, projectController.updateProject)
routes.put("/icon/:id", authMiddleware.identifyUser, upload.single("image"), projectController.updateProjectIcon)
routes.delete("/delete/:id", authMiddleware.identifyUser, projectController.deleteProject)

module.exports = routes
