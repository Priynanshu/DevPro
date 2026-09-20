const passport = require("passport")
const { Strategy: GoogleStrategy } = require("passport-google-oauth20")
const userModel = require("../models/user.models")

const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`
const isGoogleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)

if (isGoogleConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${backendUrl}/api/auth/google/callback`
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value

          if (!email) {
            return done(new Error("Google Account Has No Email"), null)
          }

          let user = await userModel.findOne({ email })

          if (!user) {
            user = await userModel.create({
              username: profile.displayName,
              email,
              password: profile.id,
              profileImage: profile.photos?.[0]?.value
            })
          }

          return done(null, user)
        } catch (error) {
          return done(error, null)
        }
      }
    )
  )
} else {
  console.log("Google OAuth Not Configured — Set GOOGLE_CLIENT_ID And GOOGLE_CLIENT_SECRET In .env To Enable It")
}

passport.serializeUser((user, done) => done(null, user._id))

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id)
    done(null, user || false)
  } catch (error) {
    done(error, false)
  }
})

module.exports = { passport, isGoogleConfigured }