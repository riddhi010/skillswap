const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const User = require("../models/User");


// @route   GET /api/users
// @desc    Explore users by role, skill, with pagination
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { role, skill, page = 1, limit = 10 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (skill) query.skills = { $regex: new RegExp(skill, "i") }; // case-insensitive

    // Calculate how many documents to skip
    const skip = (page - 1) * limit;

    // Find users with query, skip and limit, exclude password
    const users = await User.find(query)
      .select("-password")
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    
    const totalUsers = await User.countDocuments(query);

    res.json({
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


// @route   GET /api/users/:id
// @desc    Get user profile
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put("/:id", protect, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id)
  return res.status(401).json({ message: "Unauthorized" });


    const updates = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-password");
    res.json(updatedUser);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

module.exports = router;
