const express = require("express");
const authMiddleware = require("../middleware/authMiddleware"); 
const router = express.Router();
const { addGrade, getGradesByClass } = require("../controllers/gradeController");

// Route to add a grade (Only professors should be allowed)
router.post("/add", authMiddleware, addGrade);
router.get("/class/:classId", authMiddleware, getGradesByClass);



module.exports = router;
