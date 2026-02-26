const express = require('express');
const router = express.Router();
const { getLogs } = require('../controllers/activityLogController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.get('/', protect, authorize('admin'), getLogs);

module.exports = router;
