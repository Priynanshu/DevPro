const express = require("express")
const routes = express.Router()
const authMiddleware = require("../middlewares/auth.middlewares")
const invitationController = require("../controllers/invitation.controller")

routes.post("/project/:projectId/invite", authMiddleware.identifyUser, invitationController.sendInvite)
routes.get("/project/:projectId/all", authMiddleware.identifyUser, invitationController.getProjectInvites)
routes.get("/respond/:token", invitationController.respondToInvite)
routes.post("/respond-inapp/:invitationId", authMiddleware.identifyUser, invitationController.respondToInviteInApp)
routes.delete("/cancel/:id", authMiddleware.identifyUser, invitationController.cancelInvite)

module.exports = routes
