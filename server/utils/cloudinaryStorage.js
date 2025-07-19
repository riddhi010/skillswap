const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "skillswap-resources",
    resource_type: "raw",  // to allow PDF, docs, etc.
    upload_preset: "skillswap_resource_upload", 
  },
});

module.exports = storage;
