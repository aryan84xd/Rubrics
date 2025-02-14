const express = require("express");
const Class = require("../models/Class");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// 📌 Create Class (Professor Only)
router.post("/create", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "professor") {
      return res.status(403).json({ message: "Forbidden: Only professors can create classes" });
    }

    const { name, facultyName, courseCode, year, semester, batch, department, academicYear } = req.body;
    const accessCode = Math.random().toString(36).substring(2, 8); // Generate random 6-character code

    const newClass = new Class({
      name, facultyName, courseCode, year, semester, batch, department, academicYear,
      profId: req.user.id,
      students: [], // Initialize students array
      accessCode
    });

    await newClass.save();
    res.json({ message: "Class created successfully", accessCode });
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 📌 Join Class (Student Only)
router.post("/join", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Forbidden: Only students can join classes" });
    }

    const { accessCode } = req.body;
    const classInfo = await Class.findOne({ accessCode });

    if (!classInfo) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (!classInfo.students) {
      classInfo.students = []; // ✅ Ensure array exists
    }

    // Convert ObjectId to String before checking
    if (classInfo.students.some(student => student.toString() === req.user.id.toString())) {
      return res.status(400).json({ message: "You have already joined this class" });
    }

    classInfo.students.push(req.user.id);
    await classInfo.save();

    res.json({ message: "Joined class successfully" });
  } catch (error) {
    console.error("Error joining class:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


module.exports = router;
