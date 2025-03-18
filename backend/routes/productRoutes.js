const express = require('express');
const Product = require('../models/product'); // Import the Product model
const mongoose = require('mongoose');
const router = express.Router();

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().lean(); // Use .lean() to return plain objects
    res.json(products);
  } catch (error) {
    console.error('🔥 Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// POST a new product
router.post('/', async (req, res) => {
  const { name, category, price, stock, dateAdded } = req.body;

  if (!name || !category || isNaN(price) || isNaN(stock) || !dateAdded) {
    return res.status(400).json({ message: '❌ All fields must be filled out correctly.' });
  }

  try {
    // Create a new product
    const newProduct = new Product({
      name,
      category,
      price,
      stock,
      dateAdded: new Date(dateAdded),
    });

    // Save the product to the database
    await newProduct.save();

    // Return the created product as a response
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('🔥 Error saving product:', error);
    res.status(500).json({ message: 'Error saving product', error: error.message });
  }
});

// GET a single product by ID
router.get('/:id', async (req, res) => {
  const productId = req.params.id;

  // Validate the product ID format
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: 'Invalid product ID format' });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      _id: product._id.toString(),
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      dateAdded: product.dateAdded.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('🔥 Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product details', error: error.message });
  }
});

module.exports = router;
