const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  available: { type: Boolean, default: true },
  prepTime: { type: Number, default: 10 },
  canteenId: { type: String, default: 'canteen-1' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Menu', menuSchema);
