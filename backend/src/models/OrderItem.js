const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: { type: String },
  price: { type: Number },
  qty: { type: Number, required: true }
});

module.exports = orderItemSchema;
