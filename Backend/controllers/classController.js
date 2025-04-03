const Class = require("../models/Class");
const ClassStudent = require("../models/ClassStudent");
const Assignment = require("../models/Assignment");
const mongoose = require("mongoose");

const createClass = async (req, res) => {
  try {
    if (req.user.role !== "professor") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only professors can create classes" });
    }

    const {
      name,
      facultyName,
      courseCode,
      year,
      semester,
      batch,
      department,
      academicYear,
      gradingScheme,
    } = req.body;

    // Check if the total marks in gradingScheme is 25
    const totalMarks = Object.values(gradingScheme).reduce(
      (sum, marks) => sum + marks,
      0
    );
    if (totalMarks !== 25) {
      return res
        .status(400)
        .json({ message: "Total marks in grading scheme must sum to 25" });
    }

    const crypto = require('crypto');
    const accessCode = crypto.randomBytes(3).toString('hex'); // 6 characters

    const newClass = new Class({
      name,
      facultyName,
      courseCode,
      year,
      semester,
      batch,
      department,
      academicYear,
      profId: req.user.id,
      students: [], // Can be empty initially
      accessCode,
      gradingScheme
    });

    await newClass.save();
    res.json({ message: "Class created successfully", accessCode });
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// 📌 Edit Class (Professor Only)
const editClass = async (req, res) => {
  try {
    if (req.user.role !== "professor") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only professors can edit classes" });
    }

    const { classId } = req.params;
    const updates = req.body;
    if (updates.gradingScheme) {
      const totalMarks = Object.values(updates.gradingScheme).reduce((sum, marks) => sum + marks, 0);
      if (totalMarks !== 25) {
        return res.status(400).json({ message: "Total marks in grading scheme must sum to 25" });
      }
    }

    const updatedClass = await Class.findByIdAndUpdate(classId, updates, {
      new: true,
    });

    if (!updatedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.json({ message: "Class updated successfully", class: updatedClass });
  } catch (error) {
    console.error("Error updating class:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 📌 Delete Class (Professor Only)
const deleteClass = async (req, res) => {
  try {
    if (req.user.role !== "professor") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only professors can delete classes" });
    }

    const { classId } = req.params;
    await Class.findByIdAndDelete(classId);
    await ClassStudent.deleteMany({ classId });
    await Assignment.deleteMany({ classId });

    res.json({ message: "Class deleted successfully" });
  } catch (error) {
    console.error("Error deleting class:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// 📌 Get Classes Created by Professor
const getMyClasses = async (req, res) => {
  try {
    if (req.user.role !== "professor") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only professors can view their classes" });
    }

    // Fetch all classes created by the professor, including gradingScheme
    const professorClasses = await Class.find({ profId: req.user.id });

    // If no classes are found, return a suitable message
    if (!professorClasses.length) {
      return res.status(404).json({ message: "No classes found for this professor" });
    }

    res.status(200).json({ classes: professorClasses });
  } catch (error) {
    console.error("Error fetching professor's classes:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



// 📌 Student Join Class
const joinClass = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only students can join classes" });
    }

    const { accessCode } = req.body;
    const classInfo = await Class.findOne({ accessCode });

    if (!classInfo) {
      return res.status(404).json({ message: "Class not found" });
    }

    const existingEntry = await ClassStudent.findOne({
      classId: classInfo._id,
      studentId: req.user.id,
    });

    if (existingEntry) {
      return res
        .status(400)
        .json({ message: "You have already joined this class" });
    }

    const newClassStudent = new ClassStudent({
      classId: classInfo._id,
      studentId: req.user.id,
    });
    await newClassStudent.save();

    res.json({ message: "Joined class successfully", classId: classInfo._id });
  } catch (error) {
    console.error("Error joining class:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 📌 Get Classes Joined by Student
const getStudentClasses = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only students can view their classes" });
    }

    const classStudentEntries = await ClassStudent.find({
      studentId: req.user.id,
    }).select("classId");
    const classIds = classStudentEntries.map((entry) => entry.classId);

    const studentClasses = await Class.find({ _id: { $in: classIds } }).select(
      "name facultyName courseCode year semester batch department academicYear"
    );

    res.status(200).json({ classes: studentClasses });
  } catch (error) {
    console.error("Error fetching student classes:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const getClassDetails = async (req, res) => {
  try {
    const { classId } = req.params;

    // Validate classId format
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ message: "Invalid Class ID format." });
    }

    // Fetch class details including gradingScheme
    const classInfo = await Class.findById(classId)
      .populate("profId", "name email"); // Populate professor details if needed

    if (!classInfo) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Fetch students enrolled in the class
    const students = await ClassStudent.find({ classId })
      .populate("studentId", "name sapid email") // Populate student details
      .select("studentId");

    // Return class details, including gradingScheme
    res.status(200).json({
      class: classInfo,
      students: students.length > 0 ? students.map((entry) => entry.studentId) : [], // Ensure empty array if no students
    });
  } catch (error) {
    console.error("Error fetching class info:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



// 📌 Get Assignments for a Class
const getClassAssignments = async (req, res) => {
  try {
    const { classId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ message: "Invalid Class ID format." });
    }

    const assignments = await Assignment.find({ classId }).select(
      "assignmentNumber title dateOfAssignment dueDate description"
    );

    if (!assignments.length) {
      return res
        .status(404)
        .json({ message: "No assignments found for this class." });
    }

    res.status(200).json({ assignments });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createClass,
  editClass,
  deleteClass,
  getMyClasses,
  joinClass,
  getStudentClasses,
  getClassDetails,
  getClassAssignments,
};
