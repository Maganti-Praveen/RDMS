const AcademicYear = require('../models/AcademicYear');

// @desc    Get all academic years (sorted by order)
// @route   GET /api/academic-years
exports.getAcademicYears = async (req, res, next) => {
    try {
        const years = await AcademicYear.find().sort({ order: -1 });
        res.json({ success: true, data: years });
    } catch (error) {
        next(error);
    }
};

// @desc    Add new academic year
// @route   POST /api/academic-years
exports.addAcademicYear = async (req, res, next) => {
    try {
        const { label } = req.body;
        const existing = await AcademicYear.findOne({ label });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Academic year already exists' });
        }
        const maxOrder = await AcademicYear.findOne().sort({ order: -1 });
        const year = await AcademicYear.create({
            label,
            order: maxOrder ? maxOrder.order + 1 : 1,
        });
        res.status(201).json({ success: true, data: year });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle active status
// @route   PUT /api/academic-years/:id/toggle
exports.toggleActive = async (req, res, next) => {
    try {
        const year = await AcademicYear.findById(req.params.id);
        if (!year) {
            return res.status(404).json({ success: false, message: 'Academic year not found' });
        }
        year.isActive = !year.isActive;
        await year.save();
        res.json({ success: true, data: year });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete academic year
// @route   DELETE /api/academic-years/:id
exports.deleteAcademicYear = async (req, res, next) => {
    try {
        const year = await AcademicYear.findById(req.params.id);
        if (!year) {
            return res.status(404).json({ success: false, message: 'Academic year not found' });
        }
        await year.deleteOne();
        res.json({ success: true, message: 'Academic year deleted' });
    } catch (error) {
        next(error);
    }
};
