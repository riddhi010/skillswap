// routes/upload.js  
const multer = require("multer");
const path   = require("path");
const router = require("express").Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.post("/", upload.single("avatar"), (req, res) => {
  
  res.json({ url: `/uploads/${req.file.filename}` });
});

module.exports = router;

