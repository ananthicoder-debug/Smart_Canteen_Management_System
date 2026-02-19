const mongoose = require('mongoose');
const orderItemSchema = require('./OrderItem');

const orderSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  transactionId: { type: String, unique: true, required: true },
  payment: {
    method: { type: String }, // e.g., UPI, card, cash
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    details: { type: Object }, // store payment gateway response or info
  },
  note: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
