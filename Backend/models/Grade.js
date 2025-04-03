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
    knowledge: { type: Number, min: 0 },
    description: { type: Number, min: 0 },
    demonstration: { type: Number, min: 0 },
    strategy: { type: Number, min: 0 }, 
    interpret: { type: Number, min: 0 },
    attitude: { type: Number, min: 0 },
    nonVerbalCommunication: { type: Number, min: 0 },
    total: { type: Number, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Grade", GradeSchema);
