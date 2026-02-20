const express = require('express');
const router = express.Router();
const KioskUser = require('../models/KioskUser');

// List users (include uid when appropriate)
router.get('/', async (req, res) => {
  try {
    const users = await KioskUser.find({}, 'admissionNumber name department wallet_balance role email uid');
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

// Get a single user by admission number (includes uid)
router.get('/:admissionNumber', async (req, res) => {
  try {
    const admissionNumber = req.params.admissionNumber;
    const user = await KioskUser.findOne({ admissionNumber }).select('admissionNumber name department wallet_balance role email uid');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user' });
  }
});

// Update uid for a user (patch)
router.patch('/:admissionNumber/uid', async (req, res) => {
  try {
    const admissionNumber = req.params.admissionNumber;
    const { uid } = req.body;
    const user = await KioskUser.findOneAndUpdate({ admissionNumber }, { uid }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'UID updated', user });
  } catch (err) {
    res.status(500).json({ error: 'Error updating UID' });
  }
});

module.exports = router;
