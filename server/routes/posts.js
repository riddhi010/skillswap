const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const { protect } = require("../middleware/authMiddleware");

// Create post
router.post("/", protect, async (req, res) => {
  try {
    const post = new Post({
      user: req.user._id,
      content: req.body.content,
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all posts (newest first)
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name avatar")
      .populate("comments.user", "name avatar")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Like or unlike a post
router.post("/:id/like", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id.toString();
    const index = post.likes.findIndex(id => id.toString() === userId);

    if (index === -1) {
      // Not liked yet, add like
      post.likes.push(userId);
    } else {
      // Already liked, remove like (unlike)
      post.likes.splice(index, 1);
    }

    await post.save();
    res.json({ likes: post.likes.length });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add comment to a post
router.post("/:id/comment", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const newComment = {
      user: req.user._id,
      content: req.body.content,
    };

    post.comments.push(newComment);
    await post.save();

    // Populate the comment's user details for the response
    const populatedPost = await Post.findById(post._id)
      .populate("comments.user", "name avatar")
      .populate("user", "name avatar");

    res.json(populatedPost.comments[populatedPost.comments.length - 1]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
