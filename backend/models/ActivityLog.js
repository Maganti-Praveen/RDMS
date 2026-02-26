const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    role: {
        type: String,
        trim: true,
    },
    action: {
        type: String,
        enum: ['Add', 'Update', 'Delete'],
        required: true,
    },
    category: {
        type: String,
        trim: true,
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    details: {
        type: String,
        trim: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
