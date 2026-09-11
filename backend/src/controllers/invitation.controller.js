const invitationModel = require("../models/invitation.models")
const projectModel = require("../models/project.models")
const userModel = require("../models/user.models")
const notificationModel = require("../models/notification.models")
const ApiError = require("../utils/ApiError")
const { sendEmail, isEmailConfigured } = require("../services/email.service")
const { invitationTemplate } = require("../utils/emailTemplates")
const { deleteCache } = require("../utils/cache")

const sendInvite = async (req, res, next) => {
    try {
        const { projectId } = req.params
        const { email } = req.body

        if (!email) {
            throw new ApiError("Email Is Required", 400)
        }

        const project = await projectModel.findById(projectId).populate("projectLead", "username")

        if (!project) {
            throw new ApiError("Project Not Found", 404)
        }

        if (project.projectLead._id.toString() !== req.user.userId.toString()) {
            throw new ApiError("Only Project Lead Can Invite Members", 403)
        }

        const existingUser = await userModel.findOne({ email })

        if (existingUser && project.members.some((member) => member.toString() === existingUser._id.toString())) {
            throw new ApiError("This User Is Already A Member Of This Project", 409)
        }

        const existingInvite = await invitationModel.findOne({ project: projectId, email, status: "pending" })

        if (existingInvite) {
            throw new ApiError("An Invite Is Already Pending For This Email", 409)
        }

        const invite = await invitationModel.create({
            project: projectId,
            email,
            invitedBy: req.user.userId
        })

        // In-app notification is created immediately if the invited email already
        // belongs to a registered user — this works even if email sending is not
        // configured or fails, so the invite is never silently lost.
        let emailSent = false

        if (existingUser) {
            await notificationModel.create({
                recipient: existingUser._id,
                sender: req.user.userId,
                type: "project_invite",
                message: `${project.projectLead.username} invited you to join "${project.projectName}"`,
                project: projectId,
                invitation: invite._id
            })
        }

        if (isEmailConfigured) {
            const acceptUrl = `${process.env.BACKEND_URL}/api/invitations/respond/${invite.token}?action=accept`
            const rejectUrl = `${process.env.BACKEND_URL}/api/invitations/respond/${invite.token}?action=reject`

            emailSent = await sendEmail({
                to: email,
                subject: `You've Been Invited To Join ${project.projectName}`,
                html: invitationTemplate({
                    inviterName: project.projectLead.username,
                    projectName: project.projectName,
                    acceptUrl,
                    rejectUrl
                })
            })
        }

        return res.status(201).json({
            success: true,
            message: emailSent
                ? "Invitation Sent Successfully"
                : existingUser
                    ? "Invite Sent — Notified In-App (Email Not Configured Or Failed)"
                    : "Invite Created — This Email Has No Account Yet, So It Will Only Work If They Sign Up And Email Is Configured",
            emailSent,
            invite
        })

    } catch (error) {
        next(error)
    }
}

const getProjectInvites = async (req, res, next) => {
    try {
        const { projectId } = req.params

        const invites = await invitationModel.find({ project: projectId }).sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            message: "Invites Fetched Successfully",
            invites
        })

    } catch (error) {
        next(error)
    }
}

const respondToInvite = async (req, res, next) => {
    try {
        const { token } = req.params
        const { action } = req.query

        const invite = await invitationModel.findOne({ token })

        if (!invite || invite.status !== "pending" || invite.expiresAt < new Date()) {
            return res.redirect(`${process.env.CLIENT_URL}/invite-result?status=invalid`)
        }

        if (action === "reject") {
            invite.status = "rejected"
            await invite.save()
            return res.redirect(`${process.env.CLIENT_URL}/invite-result?status=rejected`)
        }

        const user = await userModel.findOne({ email: invite.email })

        if (!user) {
            return res.redirect(`${process.env.CLIENT_URL}/invite-result?status=no-account&email=${encodeURIComponent(invite.email)}`)
        }

        await projectModel.findByIdAndUpdate(invite.project, { $addToSet: { members: user._id } })

        invite.status = "accepted"
        await invite.save()

        await deleteCache(`projects:user:*`)
        await deleteCache(`project:${invite.project}`)

        return res.redirect(`${process.env.CLIENT_URL}/invite-result?status=accepted`)

    } catch (error) {
        next(error)
    }
}

// Lets a logged-in user accept/reject an invite directly from their
// Notifications page, without needing to click the email link.
const respondToInviteInApp = async (req, res, next) => {
    try {
        const { invitationId } = req.params
        const { action } = req.body

        if (!["accept", "reject"].includes(action)) {
            throw new ApiError("Action Must Be Accept Or Reject", 400)
        }

        const invite = await invitationModel.findById(invitationId)

        if (!invite) {
            throw new ApiError("Invite Not Found", 404)
        }

        const currentUser = await userModel.findById(req.user.userId)

        if (invite.email !== currentUser.email) {
            throw new ApiError("This Invite Was Not Sent To Your Account", 403)
        }

        if (invite.status !== "pending") {
            throw new ApiError("This Invite Has Already Been Responded To", 409)
        }

        if (action === "reject") {
            invite.status = "rejected"
            await invite.save()

            return res.status(200).json({
                success: true,
                message: "Invite Rejected",
                status: "rejected"
            })
        }

        await projectModel.findByIdAndUpdate(invite.project, { $addToSet: { members: currentUser._id } })
        invite.status = "accepted"
        await invite.save()

        await deleteCache(`projects:user:*`)
        await deleteCache(`project:${invite.project}`)

        return res.status(200).json({
            success: true,
            message: "Invite Accepted — You're Now A Member Of This Project",
            status: "accepted"
        })

    } catch (error) {
        next(error)
    }
}

const cancelInvite = async (req, res, next) => {
    try {
        const { id } = req.params

        const invite = await invitationModel.findById(id)

        if (!invite) {
            throw new ApiError("Invite Not Found", 404)
        }

        await invitationModel.findByIdAndDelete(id)

        return res.status(200).json({
            success: true,
            message: "Invite Cancelled Successfully"
        })

    } catch (error) {
        next(error)
    }
}

module.exports = { sendInvite, getProjectInvites, respondToInvite, respondToInviteInApp, cancelInvite }
