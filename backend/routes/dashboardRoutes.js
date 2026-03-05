const express = require('express');
const router = express.Router();
const { getStats, getChartData, getYearTrend, getTopContributors, compareFaculty, compareDept } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.get('/stats', protect, authorize('admin', 'hod'), getStats);
router.get('/chart', protect, authorize('admin', 'hod'), getChartData);
router.get('/trends', protect, authorize('admin', 'hod'), getYearTrend);
router.get('/top-contributors', protect, authorize('admin', 'hod'), getTopContributors);
router.get('/compare', protect, authorize('admin', 'hod'), compareFaculty);
router.get('/compare-dept', protect, authorize('admin'), compareDept);

module.exports = router;

