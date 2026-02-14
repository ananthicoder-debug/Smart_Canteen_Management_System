const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Inventory = require('../models/Inventory');

exports.createOrder = asyncHandler(async (req, res) => {
  const { items, note } = req.body; // items: [{ menuItem, qty }]
  if (!items || !items.length) { res.status(400); throw new Error('No items'); }
  let total = 0;
  const prepared = [];
  for (const it of items) {
    const mi = await MenuItem.findById(it.menuItem);
    if (!mi) { res.status(404); throw new Error('MenuItem not found'); }
    // check inventory if exists
    const inv = await Inventory.findOne({ item: mi._id });
    if (inv && inv.quantity < it.qty) { res.status(400); throw new Error(`Insufficient stock for ${mi.name}`); }
    total += mi.price * it.qty;
    prepared.push({ menuItem: mi._id, name: mi.name, price: mi.price, qty: it.qty });
  }
  // decrement inventory
  for (const it of items) {
    await Inventory.findOneAndUpdate({ item: it.menuItem }, { $inc: { quantity: -it.qty } });
  }
  const order = await Order.create({ student: req.user._id, items: prepared, total, note });
  res.status(201).json(order);
});

exports.listOrders = asyncHandler(async (req, res) => {
  if (req.user.role === 'staff') {
    const orders = await Order.find().populate('student', 'name email');
    return res.json(orders);
  }
  const orders = await Order.find({ student: req.user._id });
  res.json(orders);
});

exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('student', 'name email');
  if (!order) { res.status(404); throw new Error('Not found'); }
  if (req.user.role === 'student' && !order.student._id.equals(req.user._id)) { res.status(403); throw new Error('Forbidden'); }
  res.json(order);
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Not found'); }
  const prev = order.status;
  order.status = status;
  await order.save();
  if (prev !== 'Cancelled' && status === 'Cancelled') {
    for (const it of order.items) {
      await Inventory.findOneAndUpdate({ item: it.menuItem }, { $inc: { quantity: it.qty } });
    }
  }
  res.json(order);
});
