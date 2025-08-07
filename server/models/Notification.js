
const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text:    String,
    isRead:  { type: Boolean, default: false },
    link:    String,          
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);

