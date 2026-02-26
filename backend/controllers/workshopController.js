const Workshop = require('../models/Workshop');
const User = require('../models/User');
const logActivity = require('../utils/logActivity');
const { saveToMemory, deleteFromMemory } = require('../middleware/upload');
const { createNotification } = require('./notificationController');

// @desc    Get workshops with filters
// @route   GET /api/workshops
exports.getWorkshops = async (req, res, next) => {
    try {
        let query = {};
        const { facultyId, department, academicYear, role, search } = req.query;

        if (facultyId) query.facultyId = facultyId;

        if (department || req.user.role === 'hod') {
            const dept = department || req.user.department;
            const facultyIds = await User.find({ department: dept }).distinct('_id');
            query.facultyId = { $in: facultyIds };
        }

        if (academicYear) query.academicYear = academicYear;
        if (role) query.role = role;
        if (search) query.title = { $regex: search, $options: 'i' };

        const records = await Workshop.find(query)
            .populate('facultyId', 'name department employeeId')
            .sort({ date: -1 });

        res.json({ success: true, count: records.length, data: records });
    } catch (error) {
        next(error);
    }
};

// @desc    Get workshops for a specific faculty
// @route   GET /api/workshops/faculty/:facultyId
exports.getFacultyWorkshops = async (req, res, next) => {
    try {
        let query = { facultyId: req.params.facultyId };
        const { academicYear, role } = req.query;
        if (academicYear) query.academicYear = academicYear;
        if (role) query.role = role;

        const records = await Workshop.find(query).sort({ date: -1 });
        res.json({ success: true, count: records.length, data: records });
    } catch (error) {
        next(error);
    }
};

// @desc    Add workshop
// @route   POST /api/workshops/:facultyId
exports.addWorkshop = async (req, res, next) => {
    try {
        req.body.facultyId = req.params.facultyId;
        if (req.file) {
            const result = saveToMemory(req.file.buffer, 'workshops', req.file.originalname);
            req.body.certificateUrl = result.url;
        }
        const record = await Workshop.create(req.body);

        await logActivity({
            userId: req.user._id, role: req.user.role,
            action: 'Add', category: 'Workshop', targetId: record._id,
            details: `Added workshop: ${record.title}`,
        });

        if (req.user._id.toString() !== req.params.facultyId) {
            await createNotification(req.params.facultyId, `New workshop added: ${record.title}`, 'Workshop', '/my-profile');
        }

        res.status(201).json({ success: true, data: record });
    } catch (error) {
        next(error);
    }
};

// @desc    Update workshop
// @route   PUT /api/workshops/:id
exports.updateWorkshop = async (req, res, next) => {
    try {
        let record = await Workshop.findById(req.params.id);
        if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

        if (req.file) {
            if (record.certificateUrl) deleteFromMemory(record.certificateUrl);
            const result = saveToMemory(req.file.buffer, 'workshops', req.file.originalname);
            req.body.certificateUrl = result.url;
        }

        record = await Workshop.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        await logActivity({
            userId: req.user._id, role: req.user.role,
            action: 'Update', category: 'Workshop', targetId: record._id,
            details: `Updated workshop: ${record.title}`,
        });

        res.json({ success: true, data: record });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete workshop
// @route   DELETE /api/workshops/:id
exports.deleteWorkshop = async (req, res, next) => {
    try {
        const record = await Workshop.findById(req.params.id);
        if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

        if (record.certificateUrl) deleteFromMemory(record.certificateUrl);

        await logActivity({
            userId: req.user._id, role: req.user.role,
            action: 'Delete', category: 'Workshop', targetId: record._id,
            details: `Deleted workshop: ${record.title}`,
        });

        await Workshop.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Record deleted' });
    } catch (error) {
        next(error);
    }
};
