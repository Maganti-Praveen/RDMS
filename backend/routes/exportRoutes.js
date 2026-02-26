const express = require('express');
const router = express.Router();
const { exportExcel, exportPDF, exportNAAC } = require('../controllers/exportController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.get('/excel', protect, authorize('admin', 'hod'), exportExcel);
router.get('/pdf/:facultyId', protect, exportPDF);
router.get('/naac', protect, authorize('admin', 'hod'), exportNAAC);

module.exports = router;
