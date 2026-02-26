const Publication = require('../models/Publication');
const User = require('../models/User');

// @desc    Get domain-wise publication stats
// @route   GET /api/domains/stats
exports.getDomainStats = async (req, res, next) => {
    try {
        let matchStage = { researchDomain: { $exists: true, $ne: '' } };

        if (req.user.role === 'hod') {
            const facultyIds = await User.find({ department: req.user.department }).distinct('_id');
            matchStage.facultyId = { $in: facultyIds };
        }

        const stats = await Publication.aggregate([
            { $match: matchStage },
            { $group: { _id: '$researchDomain', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        res.json({
            success: true,
            data: stats.map(s => ({ domain: s._id, count: s.count })),
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get available research domains list
// @route   GET /api/domains/list
exports.getDomainList = async (req, res) => {
    const domains = [
        'Artificial Intelligence',
        'Machine Learning',
        'Internet of Things',
        'Cybersecurity',
        'Renewable Energy',
        'Data Science',
        'Cloud Computing',
        'Blockchain',
        'Robotics',
        'Signal Processing',
        'VLSI Design',
        'Power Systems',
        'Embedded Systems',
        'Computer Networks',
        'Image Processing',
        'Natural Language Processing',
        'Other',
    ];
    res.json({ success: true, data: domains });
};
