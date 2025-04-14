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

  // Grading categories and marks allocation
  gradingScheme: {
    type: Map,
    of: Number,
    default: {},
  },

  // ✅ Number of assignments allowed (max 10)
  numberOfAssignments: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },

  // ✅ COs for each assignment (e.g., [1, 1, 2, 3, 2])
  assignmentCOs: {
    type: [Number],
    validate: {
      validator: function (v) {
        // Length must match the number of assignments
        return v.length === this.numberOfAssignments;
      },
      message: "assignmentCOs length must match numberOfAssignments",
    },
    required: true,
  },
  // ✅ Table for Course Outcomes with Bloom's Level
  courseOutcomes: [
    {
      code: { type: String, required: true },
      outcome: { type: String, required: true },
      bloomsLevel: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model("Class", ClassSchema);