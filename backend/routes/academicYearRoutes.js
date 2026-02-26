const express = require('express');
const router = express.Router();
const { getAcademicYears, addAcademicYear, toggleActive, deleteAcademicYear } = require('../controllers/academicYearController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.get('/', protect, getAcademicYears);
router.post('/', protect, authorize('admin'), addAcademicYear);
router.put('/:id/toggle', protect, authorize('admin'), toggleActive);
router.delete('/:id', protect, authorize('admin'), deleteAcademicYear);

module.exports = router;
