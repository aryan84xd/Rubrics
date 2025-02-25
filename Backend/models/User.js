const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    sapid: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["student", "professor"], required: true },
    rollNumber: { type: String }, // Not required, checked during registration
    year: { type: Number }        // Not required, checked during registration
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
