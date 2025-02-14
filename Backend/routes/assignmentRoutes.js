const express = require("express");
const Assignment = require("../models/Assignment");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// Create Assignment
router.post("/create", authenticateToken, async (req, res) => {
  if (req.user.role !== "professor") return res.status(403).json({ message: "Forbidden" });

  const { assignmentNumber, title, description, classId, dateOfAssignment } = req.body;
  const newAssignment = new Assignment({ assignmentNumber, title, description, classId, dateOfAssignment });

  await newAssignment.save();
  res.json({ message: "Assignment created successfully" });
});

module.exports = router;
