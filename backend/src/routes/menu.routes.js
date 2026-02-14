const express = require('express');
const router = express.Router();
const { list, get, create, update, remove } = require('../controllers/menu.controller');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.get('/', list);
router.get('/:id', get);
router.post('/', protect, requireRole('staff'), create);
router.put('/:id', protect, requireRole('staff'), update);
router.delete('/:id', protect, requireRole('staff'), remove);

module.exports = router;
