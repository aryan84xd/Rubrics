const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  sapid: { type: String, unique: true, required: true }, // Primary Key
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ["professor", "student"], required: true }
});

// Hash password before saving
UserSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

UserSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
    