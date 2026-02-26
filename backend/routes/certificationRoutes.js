const express = require('express');
const router = express.Router();
const { getCertifications, addCertification, updateCertification, deleteCertification } = require('../controllers/certificationController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/:facultyId', protect, getCertifications);
router.post('/:facultyId', protect, upload.single('file'), addCertification);
router.put('/:id', protect, upload.single('file'), updateCertification);
router.delete('/:id', protect, deleteCertification);

module.exports = router;
