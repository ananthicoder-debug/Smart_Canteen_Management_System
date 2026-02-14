const express = require('express');
const router = express.Router();
const { list, get, create, update, remove } = require('../controllers/menu.controller');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.get('/', list);
router.get('/:id', get);
router.post('/', protect, requireRole('staff', 'admin'), create);
router.put('/:id', protect, requireRole('staff', 'admin'), update);
router.delete('/:id', protect, requireRole('staff', 'admin'), remove);

module.exports = router;
