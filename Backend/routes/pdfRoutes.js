const express = require("express");
const { generateRubricPDF } = require("../controllers/pdfController");
const authMiddleware = require("../middleware/authMiddleware"); // Import middleware

const router = express.Router();

// Protect the route using authMiddleware
router.get("/generate/:classId", authMiddleware, generateRubricPDF);

module.exports = router;
