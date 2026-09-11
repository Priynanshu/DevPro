const ApiError = require("../utils/ApiError")
const jwt = require("jsonwebtoken")

const identifyUser = async (req, res, next) => {
  try {
    const token = req.cookies?.token

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
