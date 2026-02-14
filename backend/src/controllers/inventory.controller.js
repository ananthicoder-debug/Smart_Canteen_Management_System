const asyncHandler = require('express-async-handler');
const Inventory = require('../models/Inventory');

exports.list = asyncHandler(async (req, res) => {
  const items = await Inventory.find().populate('item', 'name');
  res.json(items);
});

exports.update = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const inv = await Inventory.findOne({ item: req.params.id });
  if (!inv) { res.status(404); throw new Error('Inventory item not found'); }
  inv.quantity = quantity;
  await inv.save();
  res.json(inv);
});
