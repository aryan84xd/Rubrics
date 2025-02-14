const mongoose = require('mongoose');
require('dotenv').config();

const db = async () => {
    try {
        const con = await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error(error);
    }
}

module.exports = db;