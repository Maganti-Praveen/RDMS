const Notification = require('../models/Notification');

// @desc    Get my notifications
// @route   GET /api/notifications
exports.getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });

        res.json({ success: true, data: notifications, unreadCount });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
exports.markAsRead = async (req, res, next) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { read: true });
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};

// Helper: Create notification (used by other controllers)
exports.createNotification = async (userId, message, category, link = '') => {
    try {
        await Notification.create({ userId, message, type: 'info', category, link });
    } catch (err) {
        console.error('Notification error:', err.message);
    }
};
