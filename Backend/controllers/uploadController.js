const multer = require("multer");
const xlsx = require("xlsx");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");
const ClassStudent = require("../models/ClassStudent");

// Multer Configuration for Excel Files
const storage = multer.memoryStorage(); // Store file in memory buffer
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Invalid file type. Please upload an Excel file."),
        false
      );
    }
    cb(null, true);
  },
});

// Function to validate Excel structure
const validateExcelStructure = (data) => {
  const requiredHeaders = ["SAP ID", "Name", "Roll Number", "Year"];
  const fileHeaders = Object.keys(data[0] || {});

  return requiredHeaders.every((header) => fileHeaders.includes(header));
};

const uploadStudents = async (req, res) => {
    // Remove the transaction code since you're running a standalone MongoDB
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
  
      const classId = req.params.classId;
      if (!classId) {
        return res.status(400).json({ message: "Class ID is required" });
      }
  
      // Parse the uploaded Excel file
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0]; // First sheet
      const sheet = workbook.Sheets[sheetName];
      const studentsData = xlsx.utils.sheet_to_json(sheet);
  
      if (!studentsData.length || !validateExcelStructure(studentsData)) {
        return res.status(400).json({
          message: "Invalid Excel format. Ensure correct headers: SAP ID, Name, Roll Number, Year."
        });
      }
  
      let addedStudents = [];
      let existingUsers = [];
      let enrollmentEntries = [];
  
      for (const student of studentsData) {
        const sapid = student["SAP ID"]?.toString().trim();
        const name = student["Name"]?.trim();
        const rollNumber = student["Roll Number"]?.toString().trim() || null;
        const year = student["Year"]?.toString().trim() || null;
  
        if (!sapid || !name) {
          throw new Error(`Missing required fields for SAP ID: ${sapid || "Unknown"}`);
        }
  
        let existingStudent = await User.findOne({ sapid });
  
        if (!existingStudent) {
          const hashedPassword = await bcrypt.hash("password", 10);
          existingStudent = new User({
            sapid,
            name,
            password: hashedPassword,
            role: "student",
            rollNumber,
            year,
          });
  
          await existingStudent.save();
          addedStudents.push(existingStudent);
        } else {
          existingUsers.push(existingStudent);
        }
  
        // Check if the student is already in the class
        const alreadyEnrolled = await ClassStudent.findOne({
          classId,
          studentId: existingStudent._id,
        });
        
        if (!alreadyEnrolled) {
          enrollmentEntries.push({ classId, studentId: existingStudent._id });
        }
      }
  
      // Insert all enrollments in one go for efficiency
      if (enrollmentEntries.length) {
        await ClassStudent.insertMany(enrollmentEntries);
      }
  
      res.json({
        message: `${addedStudents.length} students added, ${existingUsers.length} were already registered.`,
        addedStudents,
        existingUsers,
      });
    } catch (err) {
      console.error("Excel Upload Error:", err);
      res.status(500).json({
        message: "Error processing file. Some changes might have been made.",
        error: err.message,
      });
    }
  };

module.exports = { upload, uploadStudents };
