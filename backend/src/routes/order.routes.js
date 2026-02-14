const express = require('express');
const router = express.Router();
const { createOrder, listOrders, getOrder, updateStatus } = require('../controllers/order.controller');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.post('/', protect, requireRole('student'), createOrder);
router.get('/', protect, listOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, requireRole('staff'), updateStatus);

module.exports = router;
