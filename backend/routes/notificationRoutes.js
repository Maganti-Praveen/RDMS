const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead, sendBroadcast } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);
router.post('/send', protect, authorize('admin', 'hod'), sendBroadcast);

module.exports = router;

