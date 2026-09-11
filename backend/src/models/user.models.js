const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  profileImage: {
    type: String,
    default: "https://ik.imagekit.io/a3d4qfkiw/insta-clone-posts/97e93701392a53ae68113b48e1a8956b.jpg?updatedAt=1772970994011"
  },
  coverImage: {
    type: String,
    default: ""
  },
  bio: {
    type: String,
    maxlength: 300,
    default: ""
  },
  role: {
    type: String,
    enum: ["admin", "backend engineer", "frontend developer", "manager", "member", "designer", "qa engineer", "product owner"],
    default: "member"
  },
  refreshToken: {
    type: String,
    select: false
  }
}, { timestamps: true })

const userModel = mongoose.model("User", userSchema)

module.exports = userModel
