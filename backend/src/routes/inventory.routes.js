const express = require('express');
const router = express.Router();
const { list, update } = require('../controllers/inventory.controller');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.get('/', protect, requireRole('staff'), list);
router.put('/:id', protect, requireRole('staff'), update);

module.exports = router;
