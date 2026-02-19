const express = require('express');
const router = express.Router();
const { confirmOrderByTransaction, createOrder, listOrders, getOrder, updateStatus } = require('../controllers/order.controller');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// Staff: confirm/process order by transactionId
router.post('/confirm', protect, requireRole('staff', 'admin'), confirmOrderByTransaction);
router.post('/create', protect, requireRole('student'), createOrder);
router.get('/', protect, listOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, requireRole('staff', 'admin'), updateStatus);

module.exports = router;
