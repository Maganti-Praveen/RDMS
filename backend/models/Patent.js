const mongoose = require('mongoose');

const patentSchema = new mongoose.Schema({
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
    },
    patentNumber: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ['Filed', 'Published', 'Granted', 'Utility'],
    },
    filingDate: {
        type: Date,
    },
    grantDate: {
        type: Date,
    },
    academicYear: {
        type: String,
        trim: true,
    },
    fileUrl: {
        type: String,
    },
    publicId: {
        type: String,
    },
}, { timestamps: true });

patentSchema.index({ facultyId: 1 });
patentSchema.index({ academicYear: 1 });
patentSchema.index({ status: 1 });
patentSchema.index({ facultyId: 1, academicYear: 1 });
patentSchema.index({ title: 'text', patentNumber: 'text' });

module.exports = mongoose.model('Patent', patentSchema);
