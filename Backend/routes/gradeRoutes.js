const express = require("express");
const authMiddleware = require("../middleware/authMiddleware"); // Ensure this exists
const router = express.Router();
const { addGrade, getGradesByStudent, getGradesByAssignment, getGradesByStudentAndClass } = require("../controllers/gradeController");

// Route to add a grade (Only professors should be allowed)
router.post("/add", authMiddleware, addGrade);

// Route to get grades of a student
router.get("/student/:studentId", authMiddleware, getGradesByStudent);

// Route to get all grades for an assignment
router.get("/assignment/:assignmentId", authMiddleware, getGradesByAssignment);

router.get("/student/:studentId/class/:classId", authMiddleware, getGradesByStudentAndClass);

module.exports = router;
