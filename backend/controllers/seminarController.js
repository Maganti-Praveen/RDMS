const Seminar = require('../models/Seminar');
const User = require('../models/User');
const logActivity = require('../utils/logActivity');
const { createNotification } = require('./notificationController');

// @desc    Get seminars with filters
// @route   GET /api/seminars
exports.getSeminars = async (req, res, next) => {
    try {
        let query = {};
        const { facultyId, department, academicYear, search } = req.query;

        if (facultyId) query.facultyId = facultyId;

        if (department || req.user.role === 'hod') {
            const dept = department || req.user.department;
            const facultyIds = await User.find({ department: dept }).distinct('_id');
            query.facultyId = { $in: facultyIds };
        }

        if (academicYear) query.academicYear = academicYear;
        if (search) query.topic = { $regex: search, $options: 'i' };

        const records = await Seminar.find(query)
            .populate('facultyId', 'name department employeeId')
            .sort({ date: -1 });

        res.json({ success: true, count: records.length, data: records });
    } catch (error) {
        next(error);
    }
};

// @desc    Get seminars for a specific faculty
// @route   GET /api/seminars/faculty/:facultyId
exports.getFacultySeminars = async (req, res, next) => {
    try {
        let query = { facultyId: req.params.facultyId };
        const { academicYear } = req.query;
        if (academicYear) query.academicYear = academicYear;

        const records = await Seminar.find(query).sort({ date: -1 });
        res.json({ success: true, count: records.length, data: records });
    } catch (error) {
        next(error);
    }
};

// @desc    Add seminar
// @route   POST /api/seminars/:facultyId
exports.addSeminar = async (req, res, next) => {
    try {
        if (req.params.facultyId !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only add entries to your own profile' });
        }
        req.body.facultyId = req.params.facultyId;
        const record = await Seminar.create(req.body);

        await logActivity({
            userId: req.user._id, role: req.user.role,
            action: 'Add', category: 'Seminar', targetId: record._id,
            details: `Added seminar: ${record.topic}`,
        });

        if (req.user._id.toString() !== req.params.facultyId) {
            await createNotification(req.params.facultyId, `New seminar added: ${record.topic}`, 'Seminar', '/my-profile');
        }

        res.status(201).json({ success: true, data: record });
    } catch (error) {
        next(error);
    }
};

// @desc    Update seminar
// @route   PUT /api/seminars/:id
exports.updateSeminar = async (req, res, next) => {
    try {
        const existing = await Seminar.findById(req.params.id);
        if (!existing) return res.status(404).json({ success: false, message: 'Record not found' });

        if (existing.facultyId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only edit your own entries' });
        }

        const record = await Seminar.findByIdAndUpdate(req.params.id, req.body, {
            new: true, runValidators: true,
        });
        if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

        await logActivity({
            userId: req.user._id, role: req.user.role,
            action: 'Update', category: 'Seminar', targetId: record._id,
            details: `Updated seminar: ${record.topic}`,
        });

        res.json({ success: true, data: record });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete seminar
// @route   DELETE /api/seminars/:id
exports.deleteSeminar = async (req, res, next) => {
    try {
        const record = await Seminar.findById(req.params.id);
        if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

        if (record.facultyId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only delete your own entries' });
        }

        await logActivity({
            userId: req.user._id, role: req.user.role,
            action: 'Delete', category: 'Seminar', targetId: record._id,
            details: `Deleted seminar: ${record.topic}`,
        });

        await Seminar.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Record deleted' });
    } catch (error) {
        next(error);
    }
};
