const asyncHandler = require('express-async-handler');
const Menu = require('../models/Menu');
const Product = require('../models/Product');

const mapMenuItem = (menu) => {
  const product = menu.product || {};
  return {
    _id: menu._id,
    id: menu._id,
    name: product.name,
    description: product.description || '',
    price: product.price || 0,
    category: product.category || 'Other',
    image: product.image || '',
    available: menu.available ?? true,
    prepTime: menu.prepTime ?? 10,
    canteenId: menu.canteenId || 'canteen-1',
  };
};

exports.list = asyncHandler(async (req, res) => {
  const items = await Menu.find().populate('product');
  const payload = items.map((menu) => ({
    item: mapMenuItem(menu),
    quantity: menu.product ? menu.product.quantity : 0,
  }));
  res.json(payload);
});

exports.update = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const menu = await Menu.findById(req.params.id).populate('product');
  if (!menu || !menu.product) {
    res.status(404);
    throw new Error('Inventory item not found');
  }
  menu.product.quantity = quantity;
  await menu.product.save();
  res.json({ item: mapMenuItem(menu), quantity: menu.product.quantity });
});
