const Certification = require('../models/Certification');
const logActivity = require('../utils/logActivity');
const { saveToMemory, deleteFromMemory } = require('../middleware/upload');

// @desc    Get certifications for a faculty
// @route   GET /api/certifications/:facultyId
exports.getCertifications = async (req, res, next) => {
    try {
        const records = await Certification.find({ facultyId: req.params.facultyId }).sort({ date: -1 });
        res.json({ success: true, count: records.length, data: records });
    } catch (error) {
        next(error);
    }
};

// @desc    Add certification
// @route   POST /api/certifications/:facultyId
exports.addCertification = async (req, res, next) => {
    try {
        req.body.facultyId = req.params.facultyId;

        if (req.file) {
            const result = saveToMemory(req.file.buffer, 'certifications', req.file.originalname);
            req.body.fileUrl = result.url;
        }

        const record = await Certification.create(req.body);

        await logActivity({
            userId: req.user._id,
            role: req.user.role,
            action: 'Add',
            category: 'Certification',
            targetId: record._id,
            details: `Added certification: ${record.title}`,
        });

        res.status(201).json({ success: true, data: record });
    } catch (error) {
        next(error);
    }
};

// @desc    Update certification
// @route   PUT /api/certifications/:id
exports.updateCertification = async (req, res, next) => {
    try {
        let record = await Certification.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }

        if (req.file) {
            if (record.fileUrl) deleteFromMemory(record.fileUrl);
            const result = saveToMemory(req.file.buffer, 'certifications', req.file.originalname);
            req.body.fileUrl = result.url;
        }

        record = await Certification.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        await logActivity({
            userId: req.user._id,
            role: req.user.role,
            action: 'Update',
            category: 'Certification',
            targetId: record._id,
            details: `Updated certification: ${record.title}`,
        });

        res.json({ success: true, data: record });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete certification
// @route   DELETE /api/certifications/:id
exports.deleteCertification = async (req, res, next) => {
    try {
        const record = await Certification.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }

        if (record.fileUrl) deleteFromMemory(record.fileUrl);

        await logActivity({
            userId: req.user._id,
            role: req.user.role,
            action: 'Delete',
            category: 'Certification',
            targetId: record._id,
            details: `Deleted certification: ${record.title}`,
        });

        await Certification.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Record deleted' });
    } catch (error) {
        next(error);
    }
};
