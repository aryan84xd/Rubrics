const express = require("express");
const uploadController = require("../controllers/uploadController"); 
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Use the upload middleware from your controller with the field name
router.post(
  "/upload-students/:classId", 
  authMiddleware, 
  uploadController.upload.single("file"), // Add this line with appropriate field name
  uploadController.uploadStudents
);

module.exports = router;