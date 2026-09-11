const mongoose = require("mongoose")

const columnSchema = new mongoose.Schema({
  name: { type: String, required: true },
  order: { type: Number, required: true }
}, { _id: false })

const projectSchema = new mongoose.Schema({

  projectName: {
    type: String,
    required: true
  },

  projectKey: {
    type: String,
    required: true,
    unique: true
  },

  description: {
    type: String,
    maxlength: 500
  },

  projectLead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  startDate: {
    type: Date
  },

  endDate: {
    type: Date
  },

  projectType: {
    type: String
  },

  projectIcon: {
    type: String,
    default: "xyz.jpg"
  },

  status: {
    type: String,
    enum: ["Active", "Completed", "On Hold"],
    default: "Active"
  },

  columns: {
    type: [columnSchema],
    default: [
      { name: "Todo", order: 0 },
      { name: "In Progress", order: 1 },
      { name: "Done", order: 2 }
    ]
  }

}, { timestamps: true })

const projectModel = mongoose.model("Project", projectSchema)

module.exports = projectModel
