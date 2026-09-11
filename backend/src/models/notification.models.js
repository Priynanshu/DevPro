const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  type: {
    type: String,
    enum: [
      "task_assigned",
      "task_updated",
      "comment_added",
      "status_changed",
      "mentioned",
      "due_date_reminder",
      "project_invite"
    ],
    required: true
  },

  message: {
    type: String,
    required: true
  },

  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task"
  },

  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project"
  },

  invitation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invitation"
  },

  isRead: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

const notificationModel = mongoose.model("Notification", notificationSchema);

module.exports = notificationModel;