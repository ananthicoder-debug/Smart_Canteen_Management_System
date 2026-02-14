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
    productId: product._id,
    quantity: product.quantity ?? 0,
    ingredients: product.ingredients,
    allergens: product.allergens,
  };
};

exports.list = asyncHandler(async (req, res) => {
  const items = await Menu.find().populate('product');
  res.json(items.map(mapMenuItem));
});

exports.get = asyncHandler(async (req, res) => {
  const item = await Menu.findById(req.params.id).populate('product');
  if (!item) {
    res.status(404);
    throw new Error('Not found');
  }
  res.json(mapMenuItem(item));
});

exports.create = asyncHandler(async (req, res) => {
  const {
    productId,
    name,
    description,
    price,
    category,
    image,
    quantity,
    ingredients,
    allergens,
    available,
    prepTime,
    canteenId,
  } = req.body;

  let product;
  if (productId) {
    product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    const productUpdates = { name, description, price, category, image, quantity, ingredients, allergens };
    Object.keys(productUpdates).forEach((key) => {
      if (productUpdates[key] !== undefined) product[key] = productUpdates[key];
    });
    await product.save();
  } else {
    if (!name || price === undefined) {
      res.status(400);
      throw new Error('Name and price are required');
    }
    product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      quantity: quantity ?? 0,
      ingredients,
      allergens,
    });
  }

  const item = await Menu.create({
    product: product._id,
    available: available ?? true,
    prepTime: prepTime ?? 10,
    canteenId: canteenId || 'canteen-1',
  });

  const saved = await Menu.findById(item._id).populate('product');
  res.status(201).json(mapMenuItem(saved));
});

exports.update = asyncHandler(async (req, res) => {
  const item = await Menu.findById(req.params.id).populate('product');
  if (!item) {
    res.status(404);
    throw new Error('Not found');
  }

  const {
    name,
    description,
    price,
    category,
    image,
    quantity,
    ingredients,
    allergens,
    available,
    prepTime,
    canteenId,
  } = req.body;

  if (item.product) {
    const productUpdates = { name, description, price, category, image, quantity, ingredients, allergens };
    Object.keys(productUpdates).forEach((key) => {
      if (productUpdates[key] !== undefined) item.product[key] = productUpdates[key];
    });
    await item.product.save();
  }

  if (available !== undefined) item.available = available;
  if (prepTime !== undefined) item.prepTime = prepTime;
  if (canteenId !== undefined) item.canteenId = canteenId;

  await item.save();
  const updated = await Menu.findById(item._id).populate('product');
  res.json(mapMenuItem(updated));
});

exports.remove = asyncHandler(async (req, res) => {
  const item = await Menu.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Not found');
  }
  await item.deleteOne();
  res.json({ message: 'Deleted' });
});
