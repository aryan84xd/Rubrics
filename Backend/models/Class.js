const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema({
  name: { type: String, required: true },
  facultyName: { type: String, required: true },
  courseCode: { type: String, required: true },
  year: { type: String, required: true },
  semester: { type: String, required: true },
  batch: { type: String, required: true },
  department: { type: String, required: true },
  academicYear: { type: String, required: true, match: /^\d{4}-\d{2}$/ }, // Accepts "2024-25"
  profId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  accessCode: { type: String, unique: true, required: true },

  // New field for grading categories and marks allocation
  gradingScheme: {
    type: Map,
    of: Number, // Stores category name as key and allocated marks as value
    default: {},
  },
});

module.exports = mongoose.model("Class", ClassSchema);
