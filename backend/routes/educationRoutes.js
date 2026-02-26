const express = require('express');
const router = express.Router();
const { getEducation, addEducation, updateEducation, deleteEducation } = require('../controllers/educationController');
const { protect } = require('../middleware/auth');

router.get('/:facultyId', protect, getEducation);
router.post('/:facultyId', protect, addEducation);
router.put('/:id', protect, updateEducation);
router.delete('/:id', protect, deleteEducation);

module.exports = router;
