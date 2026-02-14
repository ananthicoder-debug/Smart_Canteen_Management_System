const express = require('express');
const router = express.Router();
const { overview } = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.get('/overview', protect, requireRole('staff'), overview);

module.exports = router;
