const express = require("express");
const router = express.Router();
const Session = require("../models/session");
const { protect } = require("../middleware/authMiddleware");
const Notification = require("../models/Notification");
const { nanoid } = require("nanoid");
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
// Get pending sessions for mentor (Inbox)
router.get("/inbox", protect, async (req, res) => {
  try {
    const sessions = await Session.find({
      mentor: req.user._id,
      status: "pending",
    })
      .populate("learner", "name avatar")
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch session requests" });
  }
});
// Accept or reject a session request
router.put("/:id", protect, async (req, res) => {
  const { action } = req.body;          // "accept" or "reject"

  try {
    // 1) Find the session
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });

    // 2) Security: only the mentor can respond
    if (session.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // 3) Update status and create meetingId if accepted
    if (action === "accept") {
      session.status = "accepted";
      if (!session.meetingId) session.meetingId = nanoid(8); // e.g. 02cnrczd
    } else {
      session.status = "rejected";
    }
    await session.save();

    // 4) Create a notification for the learner
    const notifText =
      action === "accept"
        ? `✅ Your session request for "${session.skill}" was accepted. Click to join!`
        : `❌ Your session request for "${session.skill}" was rejected.`;

    await Notification.create({
      user: session.learner,
      text: notifText,
      link: action === "accept" ? `/live/${session.meetingId}` : "",
    });

    // 5) Send response back to mentor frontend
    res.json({
      success: true,
      status: session.status,
      meetingId: session.meetingId || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update session status" });
  }
});

module.exports = router;
