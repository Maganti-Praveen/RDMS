const express = require('express');
const router = express.Router();
const { getPatents, getFacultyPatents, addPatent, updatePatent, deletePatent } = require('../controllers/patentController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', protect, getPatents);
router.get('/faculty/:facultyId', protect, getFacultyPatents);
router.post('/:facultyId', protect, upload.single('file'), addPatent);
router.put('/:id', protect, upload.single('file'), updatePatent);
router.delete('/:id', protect, deletePatent);

module.exports = router;
