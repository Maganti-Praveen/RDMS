const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
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
    issuedBy: {
        type: String,
        required: [true, 'Please add issuing organization'],
        trim: true,
    },
    date: {
        type: Date,
    },
    credentialId: {
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

module.exports = mongoose.model('Certification', certificationSchema);
