const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  saleDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
}, { timestamps: true });

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;
