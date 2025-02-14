const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema({
  name: { type: String, required: true },
  facultyName: { type: String, required: true }, // Faculty Name
  courseCode: { type: String, required: true }, // Course Code
  year: { type: String, required: true }, // Year
  semester: { type: String, required: true }, // Semester
  batch: { type: String, required: true }, // Batch
  department: { type: String, required: true }, // Department
  academicYear: { type: String, required: true, match: /^\d{4}-\d{4}$/ }, // 2024-2025 format
  profId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  accessCode: { type: String, unique: true, required: true },
});

module.exports = mongoose.model("Class", ClassSchema);
