const Notification = require('../models/Notification');
const { sendBroadcastEmail } = require('../utils/mailer');

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

// @desc    Admin/HOD sends a broadcast notification (+ optional email) to users
// @route   POST /api/notifications/send
exports.sendBroadcast = async (req, res, next) => {
    try {
        const { title, message, target, department, userIds, sendEmail } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        const User = require('../models/User');
        let query = { role: { $in: ['faculty', 'hod'] } };

        if (target === 'department' && department) {
            query.department = department;
        } else if (target === 'specific' && Array.isArray(userIds) && userIds.length > 0) {
            query = { _id: { $in: userIds } };
        }
        // HOD can only send to their own department
        if (req.user.role === 'hod') {
            query.department = req.user.department;
        }

        const recipients = await User.find(query).select('_id email name').lean();

        if (recipients.length === 0) {
            return res.status(400).json({ success: false, message: 'No recipients found' });
        }

        const fullMessage = title ? `${title}: ${message}` : message;

        const notifications = recipients.map(r => ({
            userId: r._id,
            message: fullMessage,
            type: 'info',
            category: 'General',
            link: '',
        }));

        await Notification.insertMany(notifications);

        // Fire-and-forget email broadcast if requested
        if (sendEmail) {
            sendBroadcastEmail(recipients, title, message).catch(err =>
                console.error('[Mailer] Broadcast email failed:', err.message)
            );
        }

        res.json({
            success: true,
            message: `Notification sent to ${recipients.length} user(s)${sendEmail ? ' with email' : ''}`,
            count: recipients.length,
        });
    } catch (error) {
        next(error);
    }
};
