const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["learner", "mentor", "both"],
    default: "learner",
  },
  skills: {
    type: [String],
    default: [],
  },
  
  avatar:     { type: String, default: "" },
  availability: [String],     // or use more complex structure if needed
  linkedin: String,

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
