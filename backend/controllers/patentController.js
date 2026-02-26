const Patent = require('../models/Patent');
const User = require('../models/User');
const logActivity = require('../utils/logActivity');
const { saveToMemory, deleteFromMemory } = require('../middleware/upload');
const { createNotification } = require('./notificationController');

// @desc    Get patents with filters
// @route   GET /api/patents
exports.getPatents = async (req, res, next) => {
    try {
        let query = {};
        const { facultyId, department, academicYear, status, search } = req.query;

        if (facultyId) query.facultyId = facultyId;

        if (department || req.user.role === 'hod') {
            const dept = department || req.user.department;
            const facultyIds = await User.find({ department: dept }).distinct('_id');
            query.facultyId = { $in: facultyIds };
        }

        if (academicYear) query.academicYear = academicYear;
        if (status) query.status = status;
        if (search) query.title = { $regex: search, $options: 'i' };

        const records = await Patent.find(query)
            .populate('facultyId', 'name department employeeId')
            .sort({ filingDate: -1 });

        res.json({ success: true, count: records.length, data: records });
    } catch (error) {
        next(error);
    }
};

// @desc    Get patents for a specific faculty
// @route   GET /api/patents/faculty/:facultyId
exports.getFacultyPatents = async (req, res, next) => {
    try {
        let query = { facultyId: req.params.facultyId };
        const { academicYear, status } = req.query;
        if (academicYear) query.academicYear = academicYear;
        if (status) query.status = status;

        const records = await Patent.find(query).sort({ filingDate: -1 });
        res.json({ success: true, count: records.length, data: records });
    } catch (error) {
        next(error);
    }
};

// @desc    Add patent
// @route   POST /api/patents/:facultyId
exports.addPatent = async (req, res, next) => {
    try {
        req.body.facultyId = req.params.facultyId;
        if (req.file) {
            const result = saveToMemory(req.file.buffer, 'patents', req.file.originalname);
            req.body.fileUrl = result.url;
        }
        const record = await Patent.create(req.body);

        await logActivity({
            userId: req.user._id, role: req.user.role,
            action: 'Add', category: 'Patent', targetId: record._id,
            details: `Added patent: ${record.title}`,
        });

        if (req.user._id.toString() !== req.params.facultyId) {
            await createNotification(req.params.facultyId, `New patent added: ${record.title}`, 'Patent', '/my-profile');
        }

        res.status(201).json({ success: true, data: record });
    } catch (error) {
        next(error);
    }
};

// @desc    Update patent
// @route   PUT /api/patents/:id
exports.updatePatent = async (req, res, next) => {
    try {
        let record = await Patent.findById(req.params.id);
        if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

        if (req.file) {
            if (record.fileUrl) deleteFromMemory(record.fileUrl);
            const result = saveToMemory(req.file.buffer, 'patents', req.file.originalname);
            req.body.fileUrl = result.url;
        }

        record = await Patent.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        await logActivity({
            userId: req.user._id, role: req.user.role,
            action: 'Update', category: 'Patent', targetId: record._id,
            details: `Updated patent: ${record.title}`,
        });

        res.json({ success: true, data: record });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete patent
// @route   DELETE /api/patents/:id
exports.deletePatent = async (req, res, next) => {
    try {
        const record = await Patent.findById(req.params.id);
        if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

        if (record.fileUrl) deleteFromMemory(record.fileUrl);

        await logActivity({
            userId: req.user._id, role: req.user.role,
            action: 'Delete', category: 'Patent', targetId: record._id,
            details: `Deleted patent: ${record.title}`,
        });

        await Patent.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Record deleted' });
    } catch (error) {
        next(error);
    }
};
