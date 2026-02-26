const express = require('express');
const router = express.Router();
const { getSeminars, getFacultySeminars, addSeminar, updateSeminar, deleteSeminar } = require('../controllers/seminarController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getSeminars);
router.get('/faculty/:facultyId', protect, getFacultySeminars);
router.post('/:facultyId', protect, addSeminar);
router.put('/:id', protect, updateSeminar);
router.delete('/:id', protect, deleteSeminar);

module.exports = router;
