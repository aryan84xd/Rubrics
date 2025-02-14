const mongoose = require("mongoose");

const ClassStudentSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

module.exports = mongoose.model("ClassStudent", ClassStudentSchema);
