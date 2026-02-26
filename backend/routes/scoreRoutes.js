const express = require('express');
const router = express.Router();
const { getScoreConfig, updateScoreConfig, getFacultyScore, getRankings } = require('../controllers/scoreController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.get('/config', protect, getScoreConfig);
router.put('/config/:id', protect, authorize('admin'), updateScoreConfig);
router.get('/rankings', protect, authorize('admin', 'hod'), getRankings);
router.get('/faculty/:facultyId', protect, getFacultyScore);

module.exports = router;
