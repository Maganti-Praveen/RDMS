const User = require('../models/User');
const Publication = require('../models/Publication');
const Patent = require('../models/Patent');
const Workshop = require('../models/Workshop');
const Seminar = require('../models/Seminar');
const Certification = require('../models/Certification');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
exports.getStats = async (req, res, next) => {
    try {
        let facultyQuery = {};
        let entryQuery = {};
        const { department, academicYear } = req.query;

        // HOD can only see their department
        if (req.user.role === 'hod') {
            facultyQuery.department = req.user.department;
        } else if (department) {
            facultyQuery.department = department;
        }

        // Get faculty IDs for scoped queries
        const facultyFilter = Object.keys(facultyQuery).length > 0
            ? { $in: await User.find(facultyQuery).distinct('_id') }
            : undefined;

        if (facultyFilter) entryQuery.facultyId = facultyFilter;
        if (academicYear) entryQuery.academicYear = academicYear;

        const [totalFaculty, totalPublications, totalPatents, totalWorkshops, totalSeminars, totalCertifications] = await Promise.all([
            User.countDocuments({ ...facultyQuery, role: { $in: ['faculty', 'hod'] } }),
            Publication.countDocuments(entryQuery),
            Patent.countDocuments(entryQuery),
            Workshop.countDocuments(entryQuery),
            Seminar.countDocuments(entryQuery),
            Certification.countDocuments(facultyFilter ? { facultyId: facultyFilter } : {}),
        ]);

        res.json({
            success: true,
            data: {
                totalFaculty,
                totalPublications,
                totalPatents,
                totalWorkshops,
                totalSeminars,
                totalCertifications,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get department-wise publication chart data
// @route   GET /api/dashboard/chart
exports.getChartData = async (req, res, next) => {
    try {
        const { academicYear } = req.query;

        let departments;
        if (req.user.role === 'hod') {
            departments = [req.user.department];
        } else {
            departments = await User.distinct('department');
        }

        const chartData = await Promise.all(
            departments.map(async (dept) => {
                const facultyIds = await User.find({ department: dept }).distinct('_id');
                let pubQuery = { facultyId: { $in: facultyIds } };
                let patQuery = { facultyId: { $in: facultyIds } };
                let wsQuery = { facultyId: { $in: facultyIds } };

                if (academicYear) {
                    pubQuery.academicYear = academicYear;
                    patQuery.academicYear = academicYear;
                    wsQuery.academicYear = academicYear;
                }

                const [publications, patents, workshops] = await Promise.all([
                    Publication.countDocuments(pubQuery),
                    Patent.countDocuments(patQuery),
                    Workshop.countDocuments(wsQuery),
                ]);

                return {
                    department: dept,
                    publications,
                    patents,
                    workshops,
                };
            })
        );

        res.json({ success: true, data: chartData });
    } catch (error) {
        next(error);
    }
};

const AcademicYear = require('../models/AcademicYear');

// @desc    Get year-over-year trend data
// @route   GET /api/dashboard/trends
exports.getYearTrend = async (req, res, next) => {
    try {
        const yearDocs = await AcademicYear.find().sort({ order: 1 }).lean();
        const years = yearDocs.map(y => y.label);

        let facultyFilter = {};
        if (req.user.role === 'hod') {
            const facultyIds = await User.find({ department: req.user.department }).distinct('_id');
            facultyFilter = { facultyId: { $in: facultyIds } };
        }

        const trends = await Promise.all(
            years.map(async (year) => {
                const query = { ...facultyFilter, academicYear: year };
                const [publications, patents, workshops, seminars] = await Promise.all([
                    Publication.countDocuments(query),
                    Patent.countDocuments(query),
                    Workshop.countDocuments(query),
                    Seminar.countDocuments(query),
                ]);
                return { year, publications, patents, workshops, seminars };
            })
        );

        res.json({ success: true, data: trends });
    } catch (error) {
        next(error);
    }
};

// @desc    Get top 5 contributors
// @route   GET /api/dashboard/top-contributors
exports.getTopContributors = async (req, res, next) => {
    try {
        let userQuery = { role: { $in: ['faculty', 'hod'] } };
        if (req.user.role === 'hod') {
            userQuery.department = req.user.department;
        }

        const faculty = await User.find(userQuery).select('name department').lean();

        const contributors = await Promise.all(
            faculty.map(async (f) => {
                const [pubs, pats, ws, sems] = await Promise.all([
                    Publication.countDocuments({ facultyId: f._id }),
                    Patent.countDocuments({ facultyId: f._id }),
                    Workshop.countDocuments({ facultyId: f._id }),
                    Seminar.countDocuments({ facultyId: f._id }),
                ]);
                return {
                    _id: f._id,
                    name: f.name,
                    department: f.department,
                    publications: pubs,
                    patents: pats,
                    workshops: ws,
                    seminars: sems,
                    total: pubs + pats + ws + sems,
                };
            })
        );

        contributors.sort((a, b) => b.total - a.total);
        res.json({ success: true, data: contributors.slice(0, 5) });
    } catch (error) {
        next(error);
    }
};

// @desc    Compare two faculty members
// @route   GET /api/dashboard/compare?faculty1=id1&faculty2=id2
exports.compareFaculty = async (req, res, next) => {
    try {
        const { faculty1, faculty2 } = req.query;
        if (!faculty1 || !faculty2) {
            return res.status(400).json({ success: false, message: 'Please provide two faculty IDs' });
        }

        const getStats = async (id) => {
            const user = await User.findById(id).select('name department email').lean();
            if (!user) return null;
            const [pubs, pats, ws, sems, certs] = await Promise.all([
                Publication.countDocuments({ facultyId: id }),
                Patent.countDocuments({ facultyId: id }),
                Workshop.countDocuments({ facultyId: id }),
                Seminar.countDocuments({ facultyId: id }),
                Certification.countDocuments({ facultyId: id }),
            ]);
            return { ...user, publications: pubs, patents: pats, workshops: ws, seminars: sems, certifications: certs, total: pubs + pats + ws + sems + certs };
        };

        const [f1, f2] = await Promise.all([getStats(faculty1), getStats(faculty2)]);

        if (!f1 || !f2) {
            return res.status(404).json({ success: false, message: 'One or both faculty not found' });
        }

        res.json({ success: true, data: { faculty1: f1, faculty2: f2 } });
    } catch (error) {
        next(error);
    }
};

// @desc    Compare two departments' aggregate research output
// @route   GET /api/dashboard/compare-dept
exports.compareDept = async (req, res, next) => {
    try {
        const { dept1, dept2 } = req.query;
        if (!dept1 || !dept2) {
            return res.status(400).json({ success: false, message: 'Please provide dept1 and dept2' });
        }

        const getDeptStats = async (dept) => {
            const facultyIds = await User.find({ department: dept, role: { $in: ['faculty', 'hod'] } }).distinct('_id');
            const facultyCount = facultyIds.length;
            const q = { facultyId: { $in: facultyIds } };
            const [pubs, pats, ws, sems, certs] = await Promise.all([
                Publication.countDocuments(q),
                Patent.countDocuments(q),
                Workshop.countDocuments(q),
                Seminar.countDocuments(q),
                Certification.countDocuments(q),
            ]);
            const total = pubs + pats + ws + sems + certs;
            const perFaculty = facultyCount > 0 ? (total / facultyCount).toFixed(1) : '0';
            return { department: dept, facultyCount, publications: pubs, patents: pats, workshops: ws, seminars: sems, certifications: certs, total, perFaculty };
        };

        const [d1, d2] = await Promise.all([getDeptStats(dept1), getDeptStats(dept2)]);
        res.json({ success: true, data: { dept1: d1, dept2: d2 } });
    } catch (error) {
        next(error);
    }
};

