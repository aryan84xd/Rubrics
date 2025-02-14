const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema({
  assignmentNumber: { type: Number, required: true }, // Assignment Number
  title: { type: String, required: true },
  description: { type: String },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  dateOfAssignment: { type: Date, required: true } // Assignment Date
});

module.exports = mongoose.model("Assignment", AssignmentSchema);
