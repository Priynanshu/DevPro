const ApiError = require("../utils/ApiError")
const jwt = require("jsonwebtoken")

const identifyUser = async (req, res, next) => {
  try {
    const token = req.cookies?.token

    // TEMPORARY DEBUG LOGGING — remove once the Google login bug is fixed.
    console.log("=== identifyUser debug ===")
    console.log("Cookies received:", req.cookies)
    console.log("Token present:", Boolean(token))
    console.log("Token length:", token?.length)

    if (!token) {
      throw new ApiError("Unauthorized Access", 401)
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET)

    if (!decode) {
      throw new ApiError("Invalid Token", 401)
    }

    req.user = decode

    next()
  } catch (error) {
    // TEMPORARY DEBUG LOGGING — remove once the Google login bug is fixed.
    console.log("=== identifyUser error ===")
    console.log("error.name:", error.name)
    console.log("error.message:", error.message)

    if (error.name === "TokenExpiredError") {
      return next(new ApiError("Access Token Expired", 401))
    }
    next(new ApiError("Invalid Token", 401))
  }
}

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError("Not Authenticated", 401)
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError("Access Denied", 403)
    }
    next()
  }
}

module.exports = { identifyUser, authorize }