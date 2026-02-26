const express = require('express');
const router = express.Router();
const { getReminders } = require('../controllers/reminderController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getReminders);

module.exports = router;
