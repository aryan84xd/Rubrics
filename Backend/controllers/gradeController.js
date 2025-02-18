const Grade = require("../models/Grade");
const Assignment = require("../models/Assignment");
const mongoose = require("mongoose");
// ✅ Add a Grade
const addGrade = async (req, res) => {
    try {
        const { assignmentId, studentId, knowledge, description, demonstration, strategy, attitude } = req.body;

        if (!assignmentId || !studentId) {
            return res.status(400).json({ message: "Assignment ID and Student ID are required." });
        }

        const grade = new Grade({ assignmentId, studentId, knowledge, description, demonstration, strategy, attitude });
        await grade.save();

        res.status(201).json({ message: "Grade added successfully", grade });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ Get Grades of a Student
const getGradesByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        console.log(studentId);
        const grades = await Grade.find({ studentId }).populate("assignmentId", "title");

        if (!grades.length) {
            return res.status(404).json({ message: "No grades found for this student." });
        }

        res.json(grades);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ Get Grades for an Assignment
const getGradesByAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const grades = await Grade.find({ assignmentId }).populate("studentId", "name email");

        if (!grades.length) {
            return res.status(404).json({ message: "No grades found for this assignment." });
        }

        res.json(grades);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ Get Grades of a Student for a Specific Class
const getGradesByStudentAndClass = async (req, res) => {
    try {
        let { studentId, classId } = req.params;

        // Trim classId and studentId to remove extra spaces or newline characters
        studentId = studentId.trim();
        classId = classId.trim();

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(classId)) {
            return res.status(400).json({ message: "Invalid Student ID or Class ID format" });
        }

        const grades = await Grade.find({ studentId })
            .populate({
                path: "assignmentId",
                match: { classId: classId }, // Filter assignments by classId
                select: "title"
            });

        // Remove assignments that were not matched
        const filteredGrades = grades.filter(grade => grade.assignmentId);

        if (!filteredGrades.length) {
            return res.status(404).json({ message: "No grades found for this student in this class." });
        }

        res.json(filteredGrades);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


module.exports = { addGrade, getGradesByStudent, getGradesByAssignment, getGradesByStudentAndClass };
