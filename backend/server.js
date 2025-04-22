// server.js or app.js

const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const salesRoutes = require('./routes/saleRoutes');

// Load environment variables (optional but recommended)
require('dotenv').config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB().catch((err) => {
  console.error('❌ Failed to connect to MongoDB:', err);
  process.exit(1); // Exit if DB connection fails
});

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request bodies

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);

// Fallback for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Error handling middleware (optional)
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5021;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
