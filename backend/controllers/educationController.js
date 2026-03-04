const Education = require('../models/Education');
const logActivity = require('../utils/logActivity');

// @desc    Get education for a faculty
// @route   GET /api/education/:facultyId
exports.getEducation = async (req, res, next) => {
    try {
        const records = await Education.find({ facultyId: req.params.facultyId }).sort({ year: -1 });
        res.json({ success: true, count: records.length, data: records });
    } catch (error) {
        next(error);
    }
};

// @desc    Add education
// @route   POST /api/education/:facultyId
exports.addEducation = async (req, res, next) => {
    try {
        if (req.params.facultyId !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only add entries to your own profile' });
        }
        req.body.facultyId = req.params.facultyId;
        const record = await Education.create(req.body);

        await logActivity({
            userId: req.user._id,
            role: req.user.role,
            action: 'Add',
            category: 'Education',
            targetId: record._id,
            details: `Added education: ${record.degree}`,
        });

        res.status(201).json({ success: true, data: record });
    } catch (error) {
        next(error);
    }
};

// @desc    Update education
// @route   PUT /api/education/:id
exports.updateEducation = async (req, res, next) => {
    try {
        const existing = await Education.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }

        if (existing.facultyId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only edit your own entries' });
        }

        const record = await Education.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }

        await logActivity({
            userId: req.user._id,
            role: req.user.role,
            action: 'Update',
            category: 'Education',
            targetId: record._id,
            details: `Updated education: ${record.degree}`,
        });

        res.json({ success: true, data: record });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete education
// @route   DELETE /api/education/:id
exports.deleteEducation = async (req, res, next) => {
    try {
        const record = await Education.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }

        if (record.facultyId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only delete your own entries' });
        }

        await logActivity({
            userId: req.user._id,
            role: req.user.role,
            action: 'Delete',
            category: 'Education',
            targetId: record._id,
            details: `Deleted education: ${record.degree}`,
        });

        await Education.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Record deleted' });
    } catch (error) {
        next(error);
    }
};
