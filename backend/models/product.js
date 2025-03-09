const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  dateAdded: { type: Date, required: true, default: Date.now },
}, { timestamps: true });

// Check if the model already exists before defining it
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

module.exports = Product;
