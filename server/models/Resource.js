const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    uploader:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title:      String,
    description:String,
    tags:       [String],
    fileUrl:    String,   // Cloudinary secure URL
    fileId:     String,   // Cloudinary public_id (for delete)
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resource", resourceSchema);
