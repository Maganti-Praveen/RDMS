const mongoose = require('mongoose');

const scoreConfigSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['publication', 'patent', 'workshop', 'seminar', 'certification'],
    },
    subCategory: {
        type: String,
        required: true,
        trim: true,
    },
    points: {
        type: Number,
        required: true,
        default: 1,
    },
    description: {
        type: String,
        trim: true,
    },
}, { timestamps: true });

scoreConfigSchema.index({ category: 1, subCategory: 1 }, { unique: true });

module.exports = mongoose.model('ScoreConfig', scoreConfigSchema);
