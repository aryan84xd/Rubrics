const express = require("express");
const Class = require("../models/Class");
const ClassStudent = require("../models/ClassStudent");
const authenticateToken = require("../middleware/authMiddleware");
const mongoose = require("mongoose");
const router = express.Router();
const Assignment = require("../models/Assignment");
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

router.get("/my-classes", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "professor") {
      return res.status(403).json({ message: "Forbidden: Only professors can view their classes" });
    }

    // ✅ Find all classes where professor is the creator
    const professorClasses = await Class.find({ profId: req.user.id })
      .select("name facultyName courseCode year semester batch department academicYear accessCode");

    res.status(200).json({ classes: professorClasses });

  } catch (error) {
    console.error("Error fetching professor's classes:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


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

    // Check if student already joined
    const existingEntry = await ClassStudent.findOne({
      classId: classInfo._id,
      studentId: req.user.id,
    });

    if (existingEntry) {
      return res.status(400).json({ message: "You have already joined this class" });
    }

    // Add student to class via ClassStudent model
    const newClassStudent = new ClassStudent({
      classId: classInfo._id,
      studentId: req.user.id,
    });

    await newClassStudent.save();

    res.json({ message: "Joined class successfully",
      classId: classInfo._id,
      students: req.user.id
     });
  } catch (error) {
    console.error("Error joining class:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/my-classess", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Forbidden: Only students can view their classes" });
    }

    // ✅ Find class IDs the student has joined
    const classStudentEntries = await ClassStudent.find({ studentId: req.user.id }).select("classId");

    if (classStudentEntries.length === 0) {
      return res.status(200).json({ classes: [] }); // No classes joined
    }

    const classIds = classStudentEntries.map(entry => entry.classId);

    // ✅ Retrieve class details
    const studentClasses = await Class.find({ _id: { $in: classIds } })
      .select("name facultyName courseCode year semester batch department academicYear");

    res.status(200).json({ classes: studentClasses });

  } catch (error) {
    console.error("Error fetching student classes:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/:classId", authenticateToken, async (req, res) => {
  try {
    const { classId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ message: "Invalid Class ID format." });
    }

    // ✅ Find class details
    const classInfo = await Class.findById(classId).select(
      "name facultyName courseCode year semester batch department academicYear profId"
    );

    if (!classInfo) {
      return res.status(404).json({ message: "Class not found" });
    }

    // ✅ Get all students in the class
    const students = await ClassStudent.find({ classId })
      .populate("studentId", "name sapid email") // Assuming students have name, sapid, email fields
      .select("studentId");

    res.status(200).json({
      class: classInfo,
      students: students.map((entry) => entry.studentId), // Return list of students
    });
  } catch (error) {
    console.error("Error fetching class info:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/:classId/assignments", authenticateToken, async (req, res) => {
  try {
    const { classId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ message: "Invalid Class ID format." });
    }

    // ✅ Find assignments for the given class
    const assignments = await Assignment.find({ classId })
      .select("assignmentNumber title dateOfAssignment dueDate description");

    if (!assignments.length) {
      return res.status(404).json({ message: "No assignments found for this class." });
    }

    res.status(200).json({ assignments });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;