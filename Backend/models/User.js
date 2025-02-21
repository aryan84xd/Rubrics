const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    sapid: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["student", "professor"], required: true },
    rollNumber: { 
        type: String, 
        required: function() { return this.role === "student"; }, 
        unique: function() { return this.role === "student"; } 
    },
    year: { 
        type: Number, 
        required: function() { return this.role === "student"; } 
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
    