const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ userId, role, action, category, targetId, details }) => {
    try {
        await ActivityLog.create({
            userId,
            role,
            action,
            category,
            targetId,
            details,
        });
    } catch (error) {
        console.error('Activity log error:', error);
    }
};

module.exports = logActivity;
