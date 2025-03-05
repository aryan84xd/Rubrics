const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

// Routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/verify", authController.verifyToken);
router.get("/details", authController.getUserDetails);
module.exports = router;
