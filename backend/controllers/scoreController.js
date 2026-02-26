const ScoreConfig = require('../models/ScoreConfig');
const Publication = require('../models/Publication');
const Patent = require('../models/Patent');
const Workshop = require('../models/Workshop');
const Seminar = require('../models/Seminar');
const Certification = require('../models/Certification');
const User = require('../models/User');

// @desc    Get all score configs
// @route   GET /api/scores/config
exports.getScoreConfig = async (req, res, next) => {
    try {
        const config = await ScoreConfig.find().sort({ category: 1, subCategory: 1 });
        res.json({ success: true, data: config });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a score config entry
// @route   PUT /api/scores/config/:id
exports.updateScoreConfig = async (req, res, next) => {
    try {
        const { points } = req.body;
        const config = await ScoreConfig.findByIdAndUpdate(
            req.params.id,
            { points },
            { new: true, runValidators: true }
        );
        if (!config) {
            return res.status(404).json({ success: false, message: 'Config not found' });
        }
        res.json({ success: true, data: config });
    } catch (error) {
        next(error);
    }
};

// Helper: calculate score for a faculty member
const calculateScore = async (facultyId) => {
    const configs = await ScoreConfig.find().lean();
    const configMap = {};
    configs.forEach(c => {
        configMap[`${c.category}:${c.subCategory}`] = c.points;
    });

    // Publications — score by indexedType
    const publications = await Publication.find({ facultyId }).select('indexedType publicationType').lean();
    let pubScore = 0;
    publications.forEach(p => {
        const key = `publication:${p.indexedType || p.publicationType || 'Other'}`;
        pubScore += configMap[key] || configMap['publication:Other'] || 2;
    });

    // Patents — score by status
    const patents = await Patent.find({ facultyId }).select('status').lean();
    let patScore = 0;
    patents.forEach(p => {
        const key = `patent:${p.status || 'Filed'}`;
        patScore += configMap[key] || configMap['patent:Filed'] || 5;
    });

    // Workshops — score by role
    const workshops = await Workshop.find({ facultyId }).select('role').lean();
    let wsScore = 0;
    workshops.forEach(w => {
        const key = `workshop:${w.role || 'Attended'}`;
        wsScore += configMap[key] || configMap['workshop:Attended'] || 2;
    });

    // Seminars — flat score
    const seminarCount = await Seminar.countDocuments({ facultyId });
    const semScore = seminarCount * (configMap['seminar:Presented'] || 3);

    // Certifications — flat score
    const certCount = await Certification.countDocuments({ facultyId });
    const certScore = certCount * (configMap['certification:Completed'] || 2);

    return {
        total: pubScore + patScore + wsScore + semScore + certScore,
        breakdown: {
            publications: pubScore,
            patents: patScore,
            workshops: wsScore,
            seminars: semScore,
            certifications: certScore,
        },
        counts: {
            publications: publications.length,
            patents: patents.length,
            workshops: workshops.length,
            seminars: seminarCount,
            certifications: certCount,
        },
    };
};

// @desc    Get score for a specific faculty
// @route   GET /api/scores/faculty/:facultyId
exports.getFacultyScore = async (req, res, next) => {
    try {
        const score = await calculateScore(req.params.facultyId);
        res.json({ success: true, data: score });
    } catch (error) {
        next(error);
    }
};

// @desc    Get rankings (dept top 3 + college top 5)
// @route   GET /api/scores/rankings
exports.getRankings = async (req, res, next) => {
    try {
        const faculty = await User.find({ role: { $in: ['faculty', 'hod'] } })
            .select('name department profilePicture')
            .lean();

        const scored = await Promise.all(
            faculty.map(async (f) => {
                const score = await calculateScore(f._id);
                return { ...f, score: score.total, breakdown: score.breakdown };
            })
        );

        scored.sort((a, b) => b.score - a.score);

        // College top 5
        const collegeTop5 = scored.slice(0, 5);

        // Department top 3
        const deptMap = {};
        scored.forEach(f => {
            if (!deptMap[f.department]) deptMap[f.department] = [];
            if (deptMap[f.department].length < 3) {
                deptMap[f.department].push(f);
            }
        });

        res.json({
            success: true,
            data: {
                collegeTop5,
                departmentTop3: deptMap,
            },
        });
    } catch (error) {
        next(error);
    }
};
