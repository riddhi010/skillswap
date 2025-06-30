const express = require("express");
const router = express.Router();
const Session = require("../models/session");
const { protect } = require("../middleware/authMiddleware");

// Create a new session request
router.post("/", protect, async (req, res) => {
  const { mentorId, skill, scheduledAt, message } = req.body;

  try {
    const session = await Session.create({
      learner: req.user._id, // Authenticated user's ID
      mentor: mentorId,
      skill,
      scheduledAt,
      message,
    });

    res.status(201).json({ success: true, session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to request session" });
  }
});

// Get sessions for a user (learner or mentor)
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const sessions = await Session.find({
      $or: [{ learner: userId }, { mentor: userId }],
    })
      .populate("learner", "name email")
      .populate("mentor", "name email")
      .sort({ scheduledAt: 1 });

    res.json({ success: true, sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load sessions" });
  }
});
module.exports = router;
