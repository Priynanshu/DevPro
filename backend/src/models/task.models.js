const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },

  title: {
    type: String,
    required: true,
    maxlength: 100
  },

  description: {
    type: String,
    maxlength: 500
  },

  assignTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  labels: [{
    type: String
  }],

  priority: {
    type: String,
    enum: ["critical", "high", "medium", "low"],
    default: "low"
  },

  attachments: [{
    type: String
  }],

  dueDate: {
    type: Date
  },

  status: {
    type: String,
    default: "Todo"
  },

  subtasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubTask"
  }]

}, { timestamps: true });

const taskModel = mongoose.model("Task", taskSchema);

module.exports = taskModel;