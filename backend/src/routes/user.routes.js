const express = require("express")
const userController = require("../controllers/user.controller")
const authMiddleware = require("../middlewares/auth.middlewares")
const upload = require("../middlewares/upload.middlewares")
const { passport, isGoogleConfigured } = require("../services/googleOAuth.service")
const routes = express.Router()

routes.post("/register", userController.register)
routes.post("/login", userController.login)
routes.post("/google/finalize", userController.finalizeGoogleLogin)
routes.get("/getMe", authMiddleware.identifyUser, userController.getMe)
routes.get("/user/:id", authMiddleware.identifyUser, userController.getUserById)
routes.post("/logout", authMiddleware.identifyUser, userController.logout)
routes.put("/profile-image", authMiddleware.identifyUser, upload.single("image"), userController.updateProfileImage)
routes.put("/cover-image", authMiddleware.identifyUser, upload.single("image"), userController.updateCoverImage)
routes.put("/profile", authMiddleware.identifyUser, userController.updateProfile)

routes.get("/google", (req, res, next) => {
  if (!isGoogleConfigured) {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=google_not_configured`)
  }
  passport.authenticate("google", { scope: ["profile", "email"], session: false })(req, res, next)
})

routes.get(
  "/google/callback",
  (req, res, next) => {
    if (!isGoogleConfigured) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=google_not_configured`)
    }
    passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`, session: false })(req, res, next)
  },
  userController.googleOAuthRegister
)

module.exports = routes