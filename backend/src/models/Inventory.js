const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  quantity: { type: Number, default: 0 }
});

module.exports = mongoose.model('Inventory', inventorySchema);
