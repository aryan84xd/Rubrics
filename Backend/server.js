const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/authRoutes");
const classRoutes = require("./routes/classRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const gradeRoutes = require("./routes/gradeRoutes");
const pdfRoutes = require("./routes/pdfRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
dotenv.config();
const app = express();
// ✅ Rate limiter middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);
app.use(
  cors({
    origin: ["http://localhost:5173", "https://rubrics-nine.vercel.app"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser()); // Required for handling cookies

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

app.get("/", (req, res) => {
  res.send("Rubrics API is Live!");
});
app.use("/auth", authRoutes);
app.use("/class", classRoutes);
app.use("/assignment", assignmentRoutes);
app.use("/grade", gradeRoutes);
app.use("/pdf", pdfRoutes);
app.use("/upload", uploadRoutes);
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
