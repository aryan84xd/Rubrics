const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Connect to SQLite
const db = new sqlite3.Database("./rubric.db", (err) => {
  if (err) console.error(err.message);
  else console.log("Connected to SQLite database");
});

// Create tables
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT CHECK(role IN ('professor', 'student')) NOT NULL
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      prof_id INTEGER,
      access_code TEXT UNIQUE NOT NULL,
      FOREIGN KEY (prof_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS class_students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_id INTEGER,
      student_id INTEGER,
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      class_id INTEGER,
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS grades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assignment_id INTEGER,
      student_id INTEGER,
      knowledge INTEGER CHECK(knowledge BETWEEN 0 AND 5),
      description INTEGER CHECK(description BETWEEN 0 AND 5),
      demonstration INTEGER CHECK(demonstration BETWEEN 0 AND 5),
      strategy INTEGER CHECK(strategy BETWEEN 0 AND 5),
      attitude INTEGER CHECK(attitude BETWEEN 0 AND 5),
      FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  );
});

// JWT Secret
const SECRET_KEY = "your_secret_key";

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Access denied" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

// Register User
app.post("/auth/register", async (req, res) => {
  const { email, password, name, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    `INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)`,
    [email, hashedPassword, name, role],
    function (err) {
      if (err) return res.status(400).json({ message: "User already exists" });
      res.json({ id: this.lastID, email, role });
    }
  );
});

// Login User
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err || !user) return res.status(400).json({ message: "User not found" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token, role: user.role });
  });
});

// Create Class (Professor)
app.post("/class/create", authenticateToken, (req, res) => {
  if (req.user.role !== "professor") return res.status(403).json({ message: "Forbidden" });

  const { name } = req.body;
  const accessCode = Math.random().toString(36).substring(2, 8);

  db.run(
    `INSERT INTO classes (name, prof_id, access_code) VALUES (?, ?, ?)`,
    [name, req.user.id, accessCode],
    function (err) {
      if (err) return res.status(400).json({ message: err.message });
      res.json({ id: this.lastID, name, accessCode });
    }
  );
});

// Join Class (Student)
app.post("/class/join", authenticateToken, (req, res) => {
  if (req.user.role !== "student") return res.status(403).json({ message: "Forbidden" });

  const { accessCode } = req.body;

  db.get(`SELECT id FROM classes WHERE access_code = ?`, [accessCode], (err, classInfo) => {
    if (err || !classInfo) return res.status(404).json({ message: "Class not found" });

    db.run(
      `INSERT INTO class_students (class_id, student_id) VALUES (?, ?)`,
      [classInfo.id, req.user.id],
      function (err) {
        if (err) return res.status(400).json({ message: "Already joined" });
        res.json({ message: "Joined class successfully" });
      }
    );
  });
});

// Create Assignment (Professor)
app.post("/assignment/create", authenticateToken, (req, res) => {
  const { title, description, classId } = req.body;

  db.run(
    `INSERT INTO assignments (title, description, class_id) VALUES (?, ?, ?)`,
    [title, description, classId],
    function (err) {
      if (err) return res.status(400).json({ message: err.message });
      res.json({ id: this.lastID, title, description });
    }
  );
});

// Submit Grades (Professor)
app.post("/grade/submit", authenticateToken, (req, res) => {
  const { assignmentId, studentId, knowledge, description, demonstration, strategy, attitude } = req.body;

  db.run(
    `INSERT INTO grades (assignment_id, student_id, knowledge, description, demonstration, strategy, attitude) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [assignmentId, studentId, knowledge, description, demonstration, strategy, attitude],
    function (err) {
      if (err) return res.status(400).json({ message: err.message });
      res.json({ message: "Grades submitted" });
    }
  );
});

// Get Grades for a Student
app.get("/grades/:studentId", authenticateToken, (req, res) => {
  db.all(`SELECT * FROM grades WHERE student_id = ?`, [req.params.studentId], (err, rows) => {
    if (err) return res.status(400).json({ message: err.message });
    res.json(rows);
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
