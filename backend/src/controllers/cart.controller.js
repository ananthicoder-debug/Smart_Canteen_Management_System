const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');

exports.getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ student: req.user._id }).populate('items.menuItem');
  if (!cart) cart = await Cart.create({ student: req.user._id, items: [] });
  res.json(cart);
});

exports.updateCart = asyncHandler(async (req, res) => {
  const { items } = req.body; // [{ menuItem, qty }]
  let cart = await Cart.findOne({ student: req.user._id });
  if (!cart) cart = await Cart.create({ student: req.user._id, items });
  else { cart.items = items; cart.updatedAt = Date.now(); await cart.save(); }
  res.json(cart);
});

exports.clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ student: req.user._id });
  if (cart) { cart.items = []; await cart.save(); }
  res.json({ message: 'Cleared' });
});
