const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  learner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  skill: { type: String, required: true },
  message:String,
  scheduledAt: { type: Date, required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  meetingId: { type: String, default: "" }, 

}, { timestamps: true });

module.exports = mongoose.model("Session", sessionSchema);
