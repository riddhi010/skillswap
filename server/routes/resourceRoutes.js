const express = require("express");
const router  = express.Router();
const multer  = require("multer");
const storage = require("../utils/cloudinaryStorage");
const cloudinary = require("../utils/cloudinary");
const upload   = multer({ storage });

const Resource = require("../models/Resource");
const { protect } = require("../middleware/authMiddleware");

/* ───────── Upload ───────── */
router.post("/", protect, upload.single("file"), async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const tagArr = tags ? tags.split(",").map((t)=>t.trim()) : [];

    const resource = await Resource.create({
      uploader: req.user._id,
      title,
      description,
      tags: tagArr,
      fileUrl: req.file.path,          // secure CDN url
      fileId:  req.file.filename,      // public_id
    });

    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

/* ───────── Query list (with tag search) ───────── */
router.get("/", protect, async (req, res) => {
  const { tag, title } = req.query;

  let filter = {};

  if (tag) {
    filter.tags = tag;
  }

  if (title) {
    filter.title = { $regex: title, $options: "i" }; // case-insensitive search
  }

  const data = await Resource.find(filter)
    .populate("uploader", "name")
    .sort({ createdAt: -1 });

  res.json(data);
});


/* ───────── Delete (owner only) ───────── */
router.delete("/:id", protect, async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) return res.status(404).send("Not found");
  if (resource.uploader.toString() !== req.user._id.toString())
    return res.status(403).send("Forbidden");

  // remove file from Cloudinary
  await cloudinary.uploader.destroy(resource.fileId, { resource_type: "raw" });
  await resource.deleteOne();
  res.json({ success: true });
});

module.exports = router;
