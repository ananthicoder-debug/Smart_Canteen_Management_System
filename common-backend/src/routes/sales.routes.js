const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const KioskUser = require('../models/KioskUser');

router.post('/', async (req, res) => {
  try {
    if (!req.body.userId || !Array.isArray(req.body.items) || typeof req.body.total !== 'number') {
      return res.status(400).json({ error: 'Missing required fields (userId, items, total)' });
    }
    const user = await KioskUser.findOne({ admissionNumber: req.body.userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const sale = new Sale({
      ...req.body,
      order_id: `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    });
    await sale.save();
    user.wallet_balance -= req.body.total;
    await user.save();
    res.json({ message: 'Sale recorded successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error recording sale', details: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find();
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching sales' });
  }
});

module.exports = router;
