// config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Connect to MongoDB using the correct URI
    await mongoose.connect("mongodb://localhost:27017/sales-dashboard", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Log a success message if connected
    console.log("✅ Connected to MongoDB (sales-dashboard)");

  } catch (error) {
    // Log an error message and stop the server if connection fails
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1); // Exit process on failure
  }
};

module.exports = connectDB;
