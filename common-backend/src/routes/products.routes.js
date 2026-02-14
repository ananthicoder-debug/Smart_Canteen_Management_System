const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Product = require('../models/Product');

router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Error fetching products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching product' });
  }
});

router.post('/update-quantity', async (req, res) => {
  const { id, quantityChange } = req.body;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid product id' });
  }
  const change = Number(quantityChange);
  if (!Number.isFinite(change)) {
    return res.status(400).json({ error: 'Invalid quantity change' });
  }
  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const currentQty = Number(product.quantity);
    const safeQty = Number.isFinite(currentQty) ? currentQty : 0;
    product.quantity = safeQty + change;
    await product.save();
    res.json({ message: 'Quantity updated', newQuantity: product.quantity });
  } catch (err) {
    console.error('Error updating quantity:', err);
    res.status(500).json({ error: 'Error updating quantity', detail: err.message });
  }
});

module.exports = router;
