const Grade = require("../models/Grade");
const Assignment = require("../models/Assignment");
const Class = require("../models/Class");
const User = require("../models/User");

// Create Assignment
const createAssignment = async (req, res) => {
  try {
    if (req.user.role !== "professor") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { assignmentNumber, title, description, classId, dateOfAssignment } =
      req.body;
    const newAssignment = new Assignment({
      assignmentNumber,
      title,
      description,
      classId,
      dateOfAssignment,
    });

    await newAssignment.save();
    res.json({
      message: "Assignment created successfully",
      assignmentId: newAssignment._id,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating assignment", error: error.message });
  }
};

// Edit Assignment
const editAssignment = async (req, res) => {
  try {
    if (req.user.role !== "professor") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { assignmentId } = req.params;
    const { title, description, dateOfAssignment } = req.body;

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      { title, description, dateOfAssignment },
      { new: true }
    );

    if (!updatedAssignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json({
      message: "Assignment updated successfully",
      assignment: updatedAssignment,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating assignment", error: error.message });
  }
};

// Delete Assignment
const deleteAssignment = async (req, res) => {
  try {
    if (req.user.role !== "professor") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { assignmentId } = req.params;
    const deletedAssignment = await Assignment.findByIdAndDelete(assignmentId);

    if (!deletedAssignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting assignment", error: error.message });
  }
};

const getGradesForAssignment = async (req, res) => {
  try {
    const { classId, assignmentId } = req.params;
    console.log("Fetching grades for:", classId, assignmentId);

    // Ensure only professors can access this
    if (req.user.role !== "professor") {
      return res.status(403).json({ message: "Access denied. Only professors can view grades." });
    }

    // Verify professor is assigned to this class
    const classData = await Class.findOne({ _id: classId, profId: req.user.id });
    if (!classData) {
      return res.status(403).json({ message: "Access denied. You are not the professor of this class." });
    }

    // Ensure the assignment belongs to the specified class
    const assignment = await Assignment.findOne({ _id: assignmentId, classId });
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found for this class." });
    }

    // Fetch all student grades for the assignment
    const grades = await Grade.find({ assignmentId })
      .populate("studentId", "sapid name rollNumber")
      .sort({ "studentId.sapid": 1 });

    res.status(200).json({ grades });
  } catch (error) {
    console.error("Error fetching grades:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { createAssignment, editAssignment, deleteAssignment,getGradesForAssignment };
