const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
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
    journalName: {
        type: String,
        trim: true,
    },
    issn: {
        type: String,
        trim: true,
    },
    volume: {
        type: String,
        trim: true,
    },
    doi: {
        type: String,
        trim: true,
    },
    indexedType: {
        type: String,
        enum: ['SCI', 'Scopus', 'SEI', 'UGC', 'Other'],
    },
    publicationType: {
        type: String,
        enum: ['Journal', 'Conference', 'Book', 'Chapter'],
    },
    academicYear: {
        type: String,
        trim: true,
    },
    researchDomain: {
        type: String,
        trim: true,
    },
    publicationDate: {
        type: Date,
    },
    fileUrl: {
        type: String,
    },
    publicId: {
        type: String,
    },
}, { timestamps: true });

publicationSchema.index({ facultyId: 1 });
publicationSchema.index({ academicYear: 1 });
publicationSchema.index({ publicationType: 1 });
publicationSchema.index({ indexedType: 1 });
publicationSchema.index({ researchDomain: 1 });
publicationSchema.index({ facultyId: 1, academicYear: 1 });
publicationSchema.index({ title: 'text', journalName: 'text', doi: 'text' });

module.exports = mongoose.model('Publication', publicationSchema);
