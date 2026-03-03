const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateUser, deleteUser, bulkDeleteUsers, getDepartments, uploadProfilePicture, removeProfilePicture, resetPassword } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { upload } = require('../middleware/upload');

router.get('/departments', protect, getDepartments);
router.get('/', protect, authorize('admin', 'hod'), getUsers);
router.post('/bulk-delete', protect, authorize('admin', 'hod'), bulkDeleteUsers);
router.get('/:id', protect, getUser);
router.put('/:id', protect, updateUser);
router.put('/:id/profile-picture', protect, upload.single('file'), uploadProfilePicture);
router.delete('/:id/profile-picture', protect, removeProfilePicture);
router.delete('/:id', protect, authorize('admin', 'hod'), deleteUser);
router.put('/:id/reset-password', protect, authorize('admin', 'hod'), resetPassword);

module.exports = router;
