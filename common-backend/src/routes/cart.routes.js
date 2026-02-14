const express = require('express');
const router = express.Router();
const { getCart, updateCart, clearCart } = require('../controllers/cart.controller');
const { protect } = require('../middleware/auth');

router.get('/', protect, getCart);
router.put('/', protect, updateCart);
router.delete('/', protect, clearCart);

module.exports = router;
