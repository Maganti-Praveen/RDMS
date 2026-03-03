const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'success', 'warning'], default: 'info' },
    category: { type: String, enum: ['Publication', 'Patent', 'Workshop', 'Seminar', 'Certification', 'User', 'General'], default: 'General' },
    link: { type: String },
    read: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
