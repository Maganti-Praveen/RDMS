const express = require('express');
const router = express.Router();
const { getWorkshops, getFacultyWorkshops, addWorkshop, updateWorkshop, deleteWorkshop } = require('../controllers/workshopController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', protect, getWorkshops);
router.get('/faculty/:facultyId', protect, getFacultyWorkshops);
router.post('/:facultyId', protect, upload.single('file'), addWorkshop);
router.put('/:id', protect, upload.single('file'), updateWorkshop);
router.delete('/:id', protect, deleteWorkshop);

module.exports = router;
