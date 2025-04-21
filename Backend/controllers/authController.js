const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// 🔹 Register User
exports.register = async (req, res) => {
  try {
    const { sapid, password, name, rollNumber, year, role } = req.body;

    if (!sapid || !password || !name || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Ensure rollNumber & year are provided for students
    if (role === "student") {
      if (!rollNumber || !year) {
        return res.status(400).json({ message: "Roll number and year are required for students" });
      }

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
};

// 🔹 Login User
exports.login = async (req, res) => {
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

    // Generate JWT Token
    const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, {
      expiresIn: "1h",
    });

    // Save token in an HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 3600000, // 1 hour
    });

    res.status(200).json({
      message: "Login successful",
      token,
      role: user.role,
      userId: user._id,
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 🔹 Logout User
exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

exports.verifyToken = (req, res) => {
  try {
    const token = req.cookies.token; // 🔹 Read from cookies
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    
    const decoded = jwt.verify(token, SECRET_KEY);
    res.status(200).json({ message: "Authenticated", user: decoded });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const token = req.cookies.token; // 🔹 Extract token from cookies
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, SECRET_KEY); // 🔹 Verify token
    const user = await User.findById(decoded.id).select("-password"); // Exclude password from response

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (error) {
    console.error("Get User Details Error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};
