const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db'); // Import DB connection
const productRoutes = require('./routes/productRoutes'); // Import product routes
const salesRoutes = require('./routes/saleRoutes'); // Import sales routes

// Initialize Express app
const app = express();

// Middleware
app.use(express.json()); // Parse incoming JSON requests
app.use(cors()); // Enable CORS for frontend requests
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Routes
app.use('/api/products', productRoutes); // Use productRoutes for /api/products
app.use('/api/sales', salesRoutes); // Use salesRoutes for /api/sales

// Root Route
app.get('/', (req, res) => {
  res.send('✅ Sales Dashboard Server is running!');
});

// Connect to MongoDB
connectDB(); // Ensure the DB connection is successful

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('🔥 Global Error:', err);
  res.status(500).json({ message: '❌ Internal Server Error', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5021;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
