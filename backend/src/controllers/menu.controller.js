const asyncHandler = require('express-async-handler');
const MenuItem = require('../models/MenuItem');

exports.list = asyncHandler(async (req, res) => {
  const items = await MenuItem.find();
  res.json(items);
});

exports.get = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) { res.status(404); throw new Error('Not found'); }
  res.json(item);
});

exports.create = asyncHandler(async (req, res) => {
  const item = await MenuItem.create(req.body);
  res.status(201).json(item);
});

exports.update = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) { res.status(404); throw new Error('Not found'); }
  Object.assign(item, req.body);
  await item.save();
  res.json(item);
});

exports.remove = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) { res.status(404); throw new Error('Not found'); }
  await item.remove();
  res.json({ message: 'Deleted' });
});
