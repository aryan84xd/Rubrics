const mongoose = require("mongoose");

const GradeSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    knowledge: { type: Number, min: 0, max: 5 },
    description: { type: Number, min: 0, max: 5 },
    demonstration: { type: Number, min: 0, max: 5 },
    strategy: { type: Number, min: 0, max: 5 },
    attitude: { type: Number, min: 0, max: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Grade", GradeSchema);
