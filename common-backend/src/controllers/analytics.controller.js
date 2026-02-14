const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');

exports.overview = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const revenueAgg = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]);
  const revenue = revenueAgg[0] ? revenueAgg[0].total : 0;
  const byStatus = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  res.json({ totalOrders, revenue, byStatus });
});
