const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Menu = require('../models/Menu');
const Product = require('../models/Product');
const crypto = require('crypto');

// Confirm/process order by transactionId (staff action)
exports.confirmOrderByTransaction = asyncHandler(async (req, res) => {
  const { transactionId, paymentMethod, paymentDetails } = req.body;
  if (!transactionId) {
    res.status(400);
    throw new Error('Transaction ID required');
  }
  const order = await Order.findOne({ transactionId });
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.status !== 'pending') {
    res.status(400);
    throw new Error('Order already processed');
  }
  order.status = 'preparing';
  order.payment = {
    method: paymentMethod || 'unknown',
    status: 'paid',
    details: paymentDetails || {},
  };
  await order.save();
  res.json({ success: true, order });
});

exports.createOrder = asyncHandler(async (req, res) => {
  const { items, note } = req.body;
  if (!items || !items.length) {
    res.status(400);
    throw new Error('No items');
  }
  let total = 0;
  const prepared = [];

  for (const it of items) {
    const menu = await Menu.findById(it.menuItem).populate('product');
    if (!menu) {
      res.status(404);
      throw new Error('Menu item not found');
    }
    if (menu.available === false) {
      res.status(400);
      throw new Error(`Menu item not available: ${menu._id}`);
    }
    const product = menu.product;
    if (!product) {
      res.status(404);
      throw new Error('Product not found for menu item');
    }
    if (product.quantity < it.qty) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }
    total += product.price * it.qty;
    prepared.push({ menuItem: menu._id, name: product.name, price: product.price, qty: it.qty });
  }

  for (const it of items) {
    const menu = await Menu.findById(it.menuItem).populate('product');
    if (menu && menu.product) {
      await Product.findByIdAndUpdate(menu.product._id, { $inc: { quantity: -it.qty } });
    }
  }

  // Generate unique transactionId
  const transactionId = crypto.randomBytes(8).toString('hex');
  const order = await Order.create({
    student: req.user._id,
    items: prepared,
    total,
    note,
    transactionId,
    payment: { status: 'pending' }
  });
  res.status(201).json({ orderId: order._id, transactionId });
});

exports.listOrders = asyncHandler(async (req, res) => {
  if (req.user.role === 'staff' || req.user.role === 'admin') {
    const orders = await Order.find().populate('student', 'name email');
    return res.json(orders);
  }
  const orders = await Order.find({ student: req.user._id });
  res.json(orders);
});

exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('student', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Not found');
  }
  if (req.user.role === 'student' && !order.student._id.equals(req.user._id)) {
    res.status(403);
    throw new Error('Forbidden');
  }
  res.json(order);
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Not found');
  }
  const prev = order.status;
  order.status = status;
  await order.save();
  if (prev !== 'cancelled' && status === 'cancelled') {
    for (const it of order.items) {
      const menu = await Menu.findById(it.menuItem).populate('product');
      if (menu && menu.product) {
        await Product.findByIdAndUpdate(menu.product._id, { $inc: { quantity: it.qty } });
      }
    }
  }
  res.json(order);
});
