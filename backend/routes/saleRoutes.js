const express = require('express');
const Sale = require('../models/Sale');
const Product = require('../models/product');
const router = express.Router();

// POST a sale
router.post('/add', async (req, res) => {
  const { productId, quantity, price, saleDate } = req.body;
  

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }

    product.stock -= quantity;
    await product.save();

    const newSale = new Sale({
      productId,
      quantity,
      price,
      totalPrice: price * quantity,
      saleDate: new Date(saleDate),
    });

    
  

    await newSale.save();
  

    res.status(201).json({ message: 'Sale recorded successfully', sale: newSale });
  } catch (error) {
    res.status(500).json({ message: 'Error recording sale' });
  }
});

// GET all sales
router.get('/', async (req, res) => {
  try {
    // Fetch all sales and populate the productId field with the product name, price, and category
    const sales = await Sale.find().populate('productId', 'name price category');  // Use populate to get product details

    

    // Format sale date to a readable format if required (e.g., "YYYY-MM-DD")
    const formattedSales = sales.map(sale => {
      sale.saleDate = sale.saleDate.toISOString().split('T')[0];  // Format date to "YYYY-MM-DD"
      return sale;
    });

    // Return the formatted sales data
    res.status(200).json(formattedSales);  // Use formattedSales instead of original sales
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ message: 'Failed to fetch sales data' });
  }
});

module.exports = router;
