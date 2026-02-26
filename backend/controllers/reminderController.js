const User = require('../models/User');
const Publication = require('../models/Publication');
const Patent = require('../models/Patent');
const Workshop = require('../models/Workshop');
const Seminar = require('../models/Seminar');
const Certification = require('../models/Certification');
const AcademicYear = require('../models/AcademicYear');

// @desc    Get reminders/alerts for current user
// @route   GET /api/reminders
exports.getReminders = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).lean();
        const reminders = [];

        // Admin doesn't have a research profile — skip all reminders
        if (req.user.role === 'admin') {
            return res.json({ success: true, data: [] });
        }

        // 1. Profile completeness check
        const requiredFields = [
            { field: 'mobileNumber', label: 'Mobile Number' },
            { field: 'domain', label: 'Research Domain' },
            { field: 'joiningDate', label: 'Joining Date' },
            { field: 'address', label: 'Address' },
            { field: 'profilePicture', label: 'Profile Picture' },
            { field: 'orcidId', label: 'ORCID ID' },
        ];

        const missing = requiredFields.filter(f => !user[f.field] || user[f.field] === '');
        if (missing.length > 0) {
            const pct = Math.round(((requiredFields.length - missing.length) / requiredFields.length) * 100);
            reminders.push({
                type: 'profile_incomplete',
                severity: pct < 50 ? 'warning' : 'info',
                title: `Profile ${pct}% Complete`,
                message: `Missing: ${missing.map(f => f.label).join(', ')}`,
                link: '/my-profile',
            });
        }

        // 2. Get active academic year
        const activeYear = await AcademicYear.findOne({ isActive: true }).sort({ order: -1 }).lean();
        const currentYear = activeYear ? activeYear.label : null;

        if (currentYear) {
            // 3. No publications this year
            const pubCount = await Publication.countDocuments({ facultyId: userId, academicYear: currentYear });
            if (pubCount === 0) {
                reminders.push({
                    type: 'no_publications',
                    severity: 'warning',
                    title: 'No Publications This Year',
                    message: `You haven't added any publications for ${currentYear}. Keep your profile updated!`,
                    link: '/my-profile',
                });
            }

            // 4. No patents this year
            const patCount = await Patent.countDocuments({ facultyId: userId, academicYear: currentYear });
            if (patCount === 0) {
                reminders.push({
                    type: 'no_patents',
                    severity: 'info',
                    title: 'No Patents This Year',
                    message: `No patent entries for ${currentYear}. Add any filed or granted patents.`,
                    link: '/my-profile',
                });
            }

            // 5. No workshops/seminars this year
            const wsCount = await Workshop.countDocuments({ facultyId: userId, academicYear: currentYear });
            const semCount = await Seminar.countDocuments({ facultyId: userId, academicYear: currentYear });
            if (wsCount === 0 && semCount === 0) {
                reminders.push({
                    type: 'no_activities',
                    severity: 'info',
                    title: 'No Workshops/Seminars This Year',
                    message: `Add workshops or seminars attended/organized in ${currentYear}.`,
                    link: '/my-profile',
                });
            }
        }

        // 6. No certifications at all
        const certCount = await Certification.countDocuments({ facultyId: userId });
        if (certCount === 0) {
            reminders.push({
                type: 'no_certifications',
                severity: 'info',
                title: 'Add Certifications',
                message: 'Upload your professional certifications to strengthen your profile.',
                link: '/my-profile',
            });
        }

        res.json({ success: true, data: reminders });
    } catch (error) {
        next(error);
    }
};
