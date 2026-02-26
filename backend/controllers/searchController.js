const Publication = require('../models/Publication');
const Patent = require('../models/Patent');
const Workshop = require('../models/Workshop');
const Seminar = require('../models/Seminar');
const User = require('../models/User');

// @desc    Global search across all modules
// @route   GET /api/search?q=query
exports.globalSearch = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length < 2) {
            return res.json({ success: true, data: { publications: [], patents: [], workshops: [], seminars: [], faculty: [] } });
        }

        const query = q.trim();
        const regex = new RegExp(query, 'i');

        // Scope to department for HOD
        let facultyFilter = {};
        if (req.user.role === 'hod') {
            facultyFilter.department = req.user.department;
        }
        if (req.user.role === 'faculty') {
            facultyFilter._id = req.user._id;
        }

        const scopedFacultyIds = Object.keys(facultyFilter).length > 0
            ? await User.find(facultyFilter).distinct('_id')
            : null;

        let entryQuery = {};
        if (scopedFacultyIds) entryQuery.facultyId = { $in: scopedFacultyIds };

        // Multi-field search: title, journal, DOI, patent number, institution
        const [publications, patents, workshops, seminars, faculty] = await Promise.all([
            Publication.find({
                ...entryQuery,
                $or: [
                    { title: regex },
                    { journalName: regex },
                    { doi: regex },
                    { researchDomain: regex },
                ],
            }).populate('facultyId', 'name department').limit(10).lean(),

            Patent.find({
                ...entryQuery,
                $or: [
                    { title: regex },
                    { patentNumber: regex },
                ],
            }).populate('facultyId', 'name department').limit(10).lean(),

            Workshop.find({
                ...entryQuery,
                $or: [
                    { title: regex },
                    { institution: regex },
                ],
            }).populate('facultyId', 'name department').limit(10).lean(),

            Seminar.find({
                ...entryQuery,
                $or: [
                    { topic: regex },
                    { institution: regex },
                ],
            }).populate('facultyId', 'name department').limit(10).lean(),

            req.user.role !== 'faculty'
                ? User.find({
                    ...facultyFilter,
                    role: { $in: ['faculty', 'hod'] },
                    $or: [
                        { name: regex },
                        { employeeId: regex },
                        { email: regex },
                        { domain: regex },
                    ],
                }).select('name department role employeeId domain').limit(10).lean()
                : [],
        ]);

        res.json({
            success: true,
            data: { publications, patents, workshops, seminars, faculty },
            total: publications.length + patents.length + workshops.length + seminars.length + faculty.length,
        });
    } catch (error) {
        next(error);
    }
};
