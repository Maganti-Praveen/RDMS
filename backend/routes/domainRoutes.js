const express = require('express');
const router = express.Router();
const { getDomainStats, getDomainList } = require('../controllers/domainController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, getDomainStats);
router.get('/list', protect, getDomainList);

module.exports = router;
