const express = require("express");
const {
  createClass,
  editClass,
  deleteClass,
  getMyClasses,
  joinClass,
  getStudentClasses,
  getClassDetails,
  getClassAssignments
} = require("../controllers/classController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", authenticateToken, createClass);
router.put("/edit/:classId", authenticateToken, editClass);
router.delete("/delete/:classId", authenticateToken, deleteClass);
router.get("/my-classes", authenticateToken, getMyClasses);
router.post("/join", authenticateToken, joinClass);
router.get("/my-classes-student", authenticateToken, getStudentClasses);
router.get("/:classId", authenticateToken, getClassDetails);
router.get("/:classId/assignments", authenticateToken, getClassAssignments);

module.exports = router;
