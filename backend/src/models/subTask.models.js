const mongoose = require("mongoose");

const subTaskSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true
  },

  title: {
    type: String,
    required: true
  },

  description: {
    type: String
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
    enum: ["Todo", "In Progress", "Done"],
    default: "Todo"
  }

}, { timestamps: true });

const subTaskModel = mongoose.model("SubTask", subTaskSchema);

module.exports = subTaskModel;