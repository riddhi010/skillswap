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
  points: {
    type: Number,
    default: 10, // Starting points
  },
  bio: {
  type: String,
  default: "",
},
social: {
  linkedin: { type: String, default: "" },
  github: { type: String, default: "" },
  twitter: { type: String, default: "" },
},

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
