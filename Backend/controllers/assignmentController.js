const Assignment = require("../models/Assignment");

// Create Assignment
const createAssignment = async (req, res) => {
  try {
    if (req.user.role !== "professor") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { assignmentNumber, title, description, classId, dateOfAssignment } = req.body;
    const newAssignment = new Assignment({ assignmentNumber, title, description, classId, dateOfAssignment });

    await newAssignment.save();
    res.json({ message: "Assignment created successfully", assignmentId: newAssignment._id });
  } catch (error) {
    res.status(500).json({ message: "Error creating assignment", error: error.message });
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

    res.json({ message: "Assignment updated successfully", assignment: updatedAssignment });
  } catch (error) {
    res.status(500).json({ message: "Error updating assignment", error: error.message });
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
    res.status(500).json({ message: "Error deleting assignment", error: error.message });
  }
};

module.exports = { createAssignment, editAssignment, deleteAssignment };
