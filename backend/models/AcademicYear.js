const mongoose = require('mongoose');

const academicYearSchema = new mongoose.Schema({
    label: {
        type: String,
        required: [true, 'Please add a label (e.g. 2024-25)'],
        unique: true,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    order: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

academicYearSchema.index({ isActive: 1 });
academicYearSchema.index({ order: 1 });

module.exports = mongoose.model('AcademicYear', academicYearSchema);
