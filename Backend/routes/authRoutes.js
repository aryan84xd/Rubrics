const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// Register User
router.post("/register", async (req, res) => {
  try {
    const { sapid, password, name, role } = req.body;
    // const hashedPassword = await bcrypt.hash(password, 10); // Hash password before saving
    const hashedPassword = await User.hashPassword(password);
    const newUser = new User({ sapid, password: hashedPassword, name, role });
    await newUser.save();
    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ message: "User already exists" });
  }
});

// Login User
router.post("/login", async (req, res) => {
  const { sapid, password } = req.body;
  console.log(sapid, password);
  const user = await User.findOne({ sapid });
  if (!user) return res.status(400).json({ message: "User not found" });
  console.log(user);
  const validPassword = await user.isValidPassword(password);
  console.log(validPassword);
  if (!validPassword)
    return res.status(401).json({ message: "Invalid credentials" });
  // Generate Token
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

  res.json({ message: "Login successful", role: user.role });
});

// Logout User (Clear Cookie)
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
