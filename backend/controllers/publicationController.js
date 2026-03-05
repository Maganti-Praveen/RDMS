const Publication = require('../models/Publication');
const User = require('../models/User');
const logActivity = require('../utils/logActivity');
const { saveToMemory, deleteFromMemory } = require('../middleware/upload');
const { createNotification } = require('./notificationController');

// @desc    Get publications with filters
// @route   GET /api/publications
exports.getPublications = async (req, res, next) => {
    try {
        let query = {};
        const { facultyId, department, academicYear, publicationType, indexedType, search } = req.query;

        if (facultyId) {
            query.facultyId = facultyId;
        }

        // Department filter – get all faculty IDs in department
        if (department || req.user.role === 'hod') {
            const dept = department || req.user.department;
            const facultyIds = await User.find({ department: dept }).distinct('_id');
            query.facultyId = { $in: facultyIds };
        }

        if (academicYear) query.academicYear = academicYear;
        if (publicationType) query.publicationType = publicationType;
        if (indexedType) query.indexedType = indexedType;
        if (search) query.title = { $regex: search, $options: 'i' };

        const records = await Publication.find(query)
            .populate('facultyId', 'name department employeeId')
            .sort({ publicationDate: -1 });

        res.json({ success: true, count: records.length, data: records });
    } catch (error) {
        next(error);
    }
};

// @desc    Get publications for a specific faculty
// @route   GET /api/publications/faculty/:facultyId
exports.getFacultyPublications = async (req, res, next) => {
    try {
        let query = { facultyId: req.params.facultyId };
        const { academicYear, publicationType, indexedType } = req.query;

        if (academicYear) query.academicYear = academicYear;
        if (publicationType) query.publicationType = publicationType;
        if (indexedType) query.indexedType = indexedType;

        const records = await Publication.find(query).sort({ publicationDate: -1 });
        res.json({ success: true, count: records.length, data: records });
    } catch (error) {
        next(error);
    }
};

// @desc    Add publication
// @route   POST /api/publications/:facultyId
exports.addPublication = async (req, res, next) => {
    try {
        // Only the faculty member can add their own entries
        if (req.params.facultyId !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only add entries to your own profile' });
        }

        req.body.facultyId = req.params.facultyId;

        if (req.file) {
            const result = saveToMemory(req.file.buffer, 'publications', req.file.originalname, req.user.employeeId, req.user.department);
            req.body.fileUrl = result.url;
        }

        const record = await Publication.create(req.body);

        await logActivity({
            userId: req.user._id,
            role: req.user.role,
            action: 'Add',
            category: 'Publication',
            targetId: record._id,
            details: `Added publication: ${record.title}`,
        });

        // Notify faculty
        if (req.user._id.toString() !== req.params.facultyId) {
            await createNotification(req.params.facultyId, `New publication added: ${record.title}`, 'Publication', '/my-profile');
        }

        res.status(201).json({ success: true, data: record });
    } catch (error) {
        next(error);
    }
};

// @desc    Update publication
// @route   PUT /api/publications/:id
exports.updatePublication = async (req, res, next) => {
    try {
        let record = await Publication.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }

        if (record.facultyId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only edit your own entries' });
        }

        if (req.file) {
            if (record.fileUrl) deleteFromMemory(record.fileUrl);
            const result = saveToMemory(req.file.buffer, 'publications', req.file.originalname, req.user.employeeId, req.user.department);
            req.body.fileUrl = result.url;
        }

        record = await Publication.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        await logActivity({
            userId: req.user._id,
            role: req.user.role,
            action: 'Update',
            category: 'Publication',
            targetId: record._id,
            details: `Updated publication: ${record.title}`,
        });

        res.json({ success: true, data: record });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete publication
// @route   DELETE /api/publications/:id
exports.deletePublication = async (req, res, next) => {
    try {
        const record = await Publication.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }

        if (record.facultyId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only delete your own entries' });
        }

        if (record.fileUrl) deleteFromMemory(record.fileUrl);

        await logActivity({
            userId: req.user._id,
            role: req.user.role,
            action: 'Delete',
            category: 'Publication',
            targetId: record._id,
            details: `Deleted publication: ${record.title}`,
        });

        await Publication.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Record deleted' });
    } catch (error) {
        next(error);
    }
};
