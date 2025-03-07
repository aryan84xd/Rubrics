const Grade = require("../models/Grade");
const User = require("../models/User");
const Assignment = require("../models/Assignment");
const mongoose = require("mongoose");
const Class = require("../models/Class");
// ✅ Add a Grade using Assignment ID, Roll Number, and Year
const addGrade = async (req, res) => {
    try {
        const { assignmentId, sapid, knowledge, description, demonstration, strategy, attitude } = req.body;

        if (!assignmentId || !sapid) {
            return res.status(400).json({ message: "Assignment ID and SAP ID are required." });
        }

        // Find student by sapid
        const student = await User.findOne({ sapid, role: "student" });

        if (!student) {
            return res.status(404).json({ message: "Student not found with this SAP ID." });
        }

        // Check if a grade already exists for this student and assignment
        const existingGrade = await Grade.findOne({ assignmentId, studentId: student._id });

        if (existingGrade) {
            return res.status(400).json({ message: "Grade already exists for this assignment and student." });
        }

        // Create and save the grade
        const grade = new Grade({
            assignmentId,
            studentId: student._id,
            knowledge,
            description,
            demonstration,
            strategy,
            attitude
        });

        await grade.save();
        res.status(201).json({ message: "Grade added successfully", grade });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


const getGradesByClass = async (req, res) => {
    try {
        const { classId } = req.params;

        if (!classId) {
            return res.status(400).json({ message: "Class ID is required." });
        }

        // Trim and convert classId to ObjectId
        const cleanClassId = classId.trim();
        if (!mongoose.Types.ObjectId.isValid(cleanClassId)) {
            return res.status(400).json({ message: "Invalid Class ID format." });
        }
        const classObjectId = new mongoose.Types.ObjectId(cleanClassId);

        // ✅ Extract user ID from token (already verified by middleware)
        const studentId = req.user.id;

        // Fetch student details (all available fields)
        const studentDetails = await User.findById(studentId).lean();
        if (!studentDetails) {
            return res.status(404).json({ message: "Student not found." });
        }

        // Fetch class details
        const classDetails = await Class.findById(classObjectId);
        if (!classDetails) {
            return res.status(404).json({ message: "Class not found." });
        }

        // Find assignments for the given class
        const assignments = await Assignment.find({ classId: classObjectId });
        const assignmentIds = assignments.map(a => a._id);

        // Find grades for the student in the given class
        const grades = await Grade.find({ studentId, assignmentId: { $in: assignmentIds } })
                                  .populate("assignmentId", "assignmentNumber title dateOfAssignment");

        // Calculate individual assignment totals and class average
        let totalScoreSum = 0;
        let totalAssignments = grades.length;

        const formattedGrades = grades.map(grade => {
            const total = (grade.knowledge || 0) + 
                          (grade.description || 0) + 
                          (grade.demonstration || 0) + 
                          (grade.strategy || 0) + 
                          (grade.attitude || 0);

            totalScoreSum += total;

            return {
                assignmentNumber: grade.assignmentId.assignmentNumber,
                title: grade.assignmentId.title,
                dateOfAssignment: grade.assignmentId.dateOfAssignment,
                knowledge: grade.knowledge || 0,
                description: grade.description || 0,
                demonstration: grade.demonstration || 0,
                strategy: grade.strategy || 0,
                attitude: grade.attitude || 0,
                total: total
            };
        });

        const classAverage = totalAssignments > 0 ? totalScoreSum / totalAssignments : null;

        res.status(200).json({ studentDetails, classDetails, grades: formattedGrades, classAverage });
    } catch (error) {
        console.error("Error fetching grades:", error);
        res.status(500).json({ message: "Server error" });
    }
};





module.exports = { 
    addGrade, 
    getGradesByClass
};
