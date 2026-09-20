const userModel = require("../models/user.models")
const ApiError = require("../utils/ApiError")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { cookieOptions } = require("../utils/generateTokens")
const { uploadImage } = require("../services/imageStore.service")

const generateLoginToken = (user) => {
    return jwt.sign({
        userId: user._id,
        email: user.email,
        role: user.role
    }, process.env.JWT_SECRET, { expiresIn: "1d" })
}

const register = async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body

        if (!username || !email || !password) {
            throw new ApiError("Username, Email And Password Are Required", 400)
        }

        const existingUser = await userModel.findOne({ email })
        if (existingUser) {
            throw new ApiError("User Already Exist", 409)
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await userModel.create({
            username,
            email,
            password: hashedPassword,
            role
        })

        const token = generateLoginToken(user)
        res.cookie("token", token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })

        return res.status(201).json({
            success: true,
            message: "User Registered Successfully",
            userData: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                role: user.role
            },
            token
        })
    } catch (error) {
        next(error)
    }
}

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            throw new ApiError("Email And Password Are Required", 400)
        }

        const user = await userModel.findOne({ email }).select("+password")

        if (!user) {
            throw new ApiError("Invalid Credentials", 401)
        }

        const verifyPassword = await bcrypt.compare(password, user.password)

        if (!verifyPassword) {
            throw new ApiError("Invalid Credentials", 401)
        }

        const token = generateLoginToken(user)
        res.cookie("token", token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })

        return res.status(200).json({
            success: true,
            message: "User Login Successfully",
            userData: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                role: user.role
            },
            token
        })
    } catch (error) {
        next(error)
    }
}

const googleOAuthRegister = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`)
        }

        const token = generateLoginToken(req.user)

        // We deliberately do NOT set the auth cookie here. Some browsers
        // (e.g. Brave's Shields, and increasingly Safari) block cookies
        // that are set on the final response of a cross-domain redirect
        // chain (Backend -> Google -> Backend -> Frontend), treating it as
        // a "bounce tracking" pattern — even though this is a completely
        // legitimate OAuth flow. To sidestep that, we hand the token to the
        // frontend via the URL, and the frontend immediately exchanges it
        // for a real cookie via a normal same-mechanism XHR call (the same
        // way email/password login already sets its cookie successfully).
        return res.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${token}`)
    } catch (error) {
        next(error)
    }
}

// Called by the frontend's /oauth-callback page right after a Google
// login redirect. Verifies the short-lived token from the URL and sets
// it as the real httpOnly auth cookie via a normal XHR response — the
// same mechanism email/password login already uses successfully.
const finalizeGoogleLogin = async (req, res, next) => {
    try {
        const { token } = req.body

        if (!token) {
            throw new ApiError("Token Is Required", 400)
        }

        let decoded
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET)
        } catch (error) {
            throw new ApiError("Invalid Or Expired Token", 401)
        }

        const user = await userModel.findById(decoded.userId)

        if (!user) {
            throw new ApiError("User Not Found", 404)
        }

        res.cookie("token", token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })

        return res.status(200).json({
            success: true,
            message: "Login Finalized Successfully",
            userData: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                role: user.role
            }
        })
    } catch (error) {
        next(error)
    }
}

const getMe = async (req, res, next) => {
    try {
        const userId = req.user.userId
        const user = await userModel.findById(userId)

        if (!user) {
            throw new ApiError("User Not Found", 404)
        }

        return res.status(200).json({
            success: true,
            message: "User Fetched Successfully",
            userData: user
        })
    } catch (error) {
        next(error)
    }
}

const updateProfileImage = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new ApiError("No Image File Provided", 400)
        }

        const imageUrl = await uploadImage(req.file.buffer, req.file.originalname, "profile")

        const user = await userModel.findByIdAndUpdate(
            req.user.userId,
            { profileImage: imageUrl },
            { new: true }
        )

        return res.status(200).json({
            success: true,
            message: "Profile Image Updated Successfully",
            userData: user
        })
    } catch (error) {
        next(error)
    }
}

const updateCoverImage = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new ApiError("No Image File Provided", 400)
        }

        const imageUrl = await uploadImage(req.file.buffer, req.file.originalname, "cover")

        const user = await userModel.findByIdAndUpdate(
            req.user.userId,
            { coverImage: imageUrl },
            { new: true }
        )

        return res.status(200).json({
            success: true,
            message: "Cover Image Updated Successfully",
            userData: user
        })
    } catch (error) {
        next(error)
    }
}

const updateProfile = async (req, res, next) => {
    try {
        const { username, bio, role } = req.body

        const updates = {}
        if (username) updates.username = username
        if (bio !== undefined) updates.bio = bio
        if (role) updates.role = role

        const user = await userModel.findByIdAndUpdate(req.user.userId, updates, { new: true, runValidators: true })

        if (!user) {
            throw new ApiError("User Not Found", 404)
        }

        return res.status(200).json({
            success: true,
            message: "Profile Updated Successfully",
            userData: user
        })
    } catch (error) {
        next(error)
    }
}

const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params

        const user = await userModel.findById(id).select("username email profileImage coverImage bio role createdAt")

        if (!user) {
            throw new ApiError("User Not Found", 404)
        }

        return res.status(200).json({
            success: true,
            message: "User Fetched Successfully",
            userData: user
        })
    } catch (error) {
        if (error.name === "CastError") {
            return next(new ApiError("Invalid User Id", 400))
        }
        next(error)
    }
}

const logout = async (req, res, next) => {
    try {
        res.clearCookie("token", cookieOptions)
        return res.status(200).json({
            success: true,
            message: "Logged Out Successfully"
        })
    } catch (error) {
        next(error)
    }
}

module.exports = { register, login, getMe, logout, googleOAuthRegister, finalizeGoogleLogin, updateProfileImage, updateCoverImage, updateProfile, getUserById }