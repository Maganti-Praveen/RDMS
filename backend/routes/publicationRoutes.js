const express = require('express');
const router = express.Router();
const { getPublications, getFacultyPublications, addPublication, updatePublication, deletePublication } = require('../controllers/publicationController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', protect, getPublications);
router.get('/faculty/:facultyId', protect, getFacultyPublications);
router.post('/:facultyId', protect, upload.single('file'), addPublication);
router.put('/:id', protect, upload.single('file'), updatePublication);
router.delete('/:id', protect, deletePublication);

module.exports = router;
