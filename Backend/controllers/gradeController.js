const Grade = require("../models/Grade");
const User = require("../models/User");
const Assignment = require("../models/Assignment");
const mongoose = require("mongoose");
const Class = require("../models/Class");

// ✅ Add a Grade using Assignment ID, Roll Number, and Year
const addGrade = async (req, res) => {
    try {
        const { assignmentId, sapid, knowledge, description, demonstration, strategy, interpret, attitude, nonVerbalCommunication } = req.body;

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

        // Calculate total score
        const total = (knowledge || 0) + (description || 0) + (demonstration || 0) + (strategy || 0) +
                      (interpret || 0) + (attitude || 0) + (nonVerbalCommunication || 0);

        // Create and save the grade
        const grade = new Grade({
            assignmentId,
            studentId: student._id,
            knowledge,
            description,
            demonstration,
            strategy,
            interpret,
            attitude,
            nonVerbalCommunication,
            total,
        });

        await grade.save();
        res.status(201).json({ message: "Grade added successfully", grade });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
const updateGrade = async (req, res) => {
    try {
        const { assignmentId, sapid, knowledge, description, demonstration, strategy, interpret, attitude, nonVerbalCommunication } = req.body;

        if (!assignmentId || !sapid) {
            return res.status(400).json({ message: "Assignment ID and SAP ID are required." });
        }

        // Find student by sapid
        const student = await User.findOne({ sapid, role: "student" });

        if (!student) {
            return res.status(404).json({ message: "Student not found with this SAP ID." });
        }

        // Find the grade to update
        const grade = await Grade.findOne({ assignmentId, studentId: student._id });

        if (!grade) {
            return res.status(404).json({ message: "Grade not found for this assignment and student." });
        }

        // Update the grade fields if provided
        grade.knowledge = knowledge ?? grade.knowledge;
        grade.description = description ?? grade.description;
        grade.demonstration = demonstration ?? grade.demonstration;
        grade.strategy = strategy ?? grade.strategy;
        grade.interpret = interpret ?? grade.interpret;
        grade.attitude = attitude ?? grade.attitude;
        grade.nonVerbalCommunication = nonVerbalCommunication ?? grade.nonVerbalCommunication;

        // Recalculate total
        grade.total =
            (grade.knowledge || 0) +
            (grade.description || 0) +
            (grade.demonstration || 0) +
            (grade.strategy || 0) +
            (grade.interpret || 0) +
            (grade.attitude || 0) +
            (grade.nonVerbalCommunication || 0);

        await grade.save();
        res.status(200).json({ message: "Grade updated successfully", grade });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ Fetch grades for a student in a given class
const getGradesByClass = async (req, res) => {
    try {
        const { classId } = req.params;

        if (!classId) {
            return res.status(400).json({ message: "Class ID is required." });
        }

        // Validate and convert classId to ObjectId
        const cleanClassId = classId.trim();
        if (!mongoose.Types.ObjectId.isValid(cleanClassId)) {
            return res.status(400).json({ message: "Invalid Class ID format." });
        }
        const classObjectId = new mongoose.Types.ObjectId(cleanClassId);

        // Extract user ID from token (already verified by middleware)
        const studentId = req.user.id;

        // Fetch student details
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
                          (grade.interpret || 0) + 
                          (grade.attitude || 0) + 
                          (grade.nonVerbalCommunication || 0);

            totalScoreSum += total;

            return {
                assignmentNumber: grade.assignmentId.assignmentNumber,
                title: grade.assignmentId.title,
                dateOfAssignment: grade.assignmentId.dateOfAssignment,
                knowledge: grade.knowledge || 0,
                description: grade.description || 0,
                demonstration: grade.demonstration || 0,
                strategy: grade.strategy || 0,
                interpret: grade.interpret || 0,
                attitude: grade.attitude || 0,
                nonVerbalCommunication: grade.nonVerbalCommunication || 0,
                total: total
            };
        });
        // ✅ Sort grades by assignment number
        formattedGrades.sort((a, b) => a.assignmentNumber - b.assignmentNumber);
        const classAverage = totalAssignments > 0 ? totalScoreSum / totalAssignments : null;

        res.status(200).json({ studentDetails, classDetails, grades: formattedGrades, classAverage });
    } catch (error) {
        console.error("Error fetching grades:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { 
    addGrade, 
    updateGrade,
    getGradesByClass
};
