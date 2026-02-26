const ActivityLog = require('../models/ActivityLog');

// @desc    Get activity logs
// @route   GET /api/activity-logs
exports.getLogs = async (req, res, next) => {
    try {
        let query = {};
        const { userId, action, category, startDate, endDate, page = 1, limit = 20 } = req.query;

        if (userId) query.userId = userId;
        if (action) query.action = action;
        if (category) query.category = category;

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        const total = await ActivityLog.countDocuments(query);
        const logs = await ActivityLog.find(query)
            .populate('userId', 'name email role department')
            .sort({ timestamp: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        res.json({
            success: true,
            count: logs.length,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            data: logs,
        });
    } catch (error) {
        next(error);
    }
};
