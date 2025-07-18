// routes/upload.js  (simple local DiskStorage; swap for Cloudinary if you prefer)
const multer = require("multer");
const path   = require("path");
const router = require("express").Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.post("/", upload.single("avatar"), (req, res) => {
  // Return a relative path; in production put full Cloudinary URL
  res.json({ url: `/uploads/${req.file.filename}` });
});

module.exports = router;
