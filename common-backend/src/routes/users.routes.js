const express = require('express');
const router = express.Router();
const KioskUser = require('../models/KioskUser');

router.get('/', async (req, res) => {
  try {
    const users = await KioskUser.find({}, 'admissionNumber name department wallet_balance role email');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

router.post('/', async (req, res) => {
  try {
    const user = new KioskUser(req.body);
    await user.save();
    res.json({ message: 'User added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error adding user' });
  }
});

module.exports = router;
