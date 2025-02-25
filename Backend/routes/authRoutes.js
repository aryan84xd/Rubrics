const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");  // ✅ Import JWT
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config(); // ✅ Load environment variables

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";
// 🔹 LOGIN API (Now Returns Token)
// 🔹 Student Registration API
// 🔹 Registration API
router.post("/register", async (req, res) => {
  try { 
    const { sapid, password, name, rollNumber, year, role } = req.body;

    if (!sapid || !password || !name || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Ensure rollNumber & year are provided for students
    if (role === "student") {
      if (!rollNumber || !year) {
        return res.status(400).json({ message: "Roll number and year are required for students" });
      }

      // ✅ Check if Roll Number already exists for the same Year (manual check)
      const existingRollNO = await User.findOne({ rollNumber, year, role: "student" });
      if (existingRollNO) {
        return res.status(400).json({ message: "Roll number already exists for this year" });
      }
    }

    // Check if SAP ID is already registered
    const existingUser = await User.findOne({ sapid });
    if (existingUser) {
      return res.status(400).json({ message: "SAP ID already exists" });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      sapid,
      password: hashedPassword,
      name,
      role,
      rollNumber: role === "student" ? rollNumber : undefined,
      year: role === "student" ? year : undefined,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

// 🔹 LOGIN API
router.post("/login", async (req, res) => {
  try {
    const { sapid, password } = req.body;
    if (!sapid || !password) {
      return res.status(400).json({ message: "SAP ID and password are required" });
    }

    const user = await User.findOne({ sapid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Generate JWT Token
    const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, {
      expiresIn: "1h",
    });
  
    // Save token in an HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true, // Prevents JavaScript access
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "Strict", // Helps prevent CSRF attacks
      maxAge: 3600000, // 1 hour
    });

    res.status(200).json({
      message: "Login successful",
      token,  // ✅ Return token to client
      role: user.role,
      userId:user._id 
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Logout User (Clear Cookie)
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
  
