// config/db.js
const mongoose = require("mongoose");
const DatabaseManager = require('../patterns/DatabaseManager');

// Set strictQuery explicitly to suppress the warning
//mongoose.set('strictQuery', true);

// Legacy function for backward compatibility
const connectDB = async () => {
  try {
    // Use Singleton pattern for database connection
    const dbManager = DatabaseManager.getInstance();
    await dbManager.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
