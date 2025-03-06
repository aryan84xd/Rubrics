const express = require("express");
const { createAssignment, editAssignment, deleteAssignment,getGradesForAssignment } = require("../controllers/assignmentController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", authenticateToken, createAssignment);
router.put("/edit/:assignmentId", authenticateToken, editAssignment);
router.delete("/delete/:assignmentId", authenticateToken, deleteAssignment);
router.get("/class/:classId/assignment/:assignmentId", authenticateToken,getGradesForAssignment);

module.exports = router;
