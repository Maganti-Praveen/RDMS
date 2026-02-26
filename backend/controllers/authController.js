const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logActivity = require('../utils/logActivity');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// @desc    Register user (Admin only)
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
    try {
        const { name, employeeId, email, password, role, department, joiningDate, mobileNumber, domain, officialEmail, address } = req.body;

        // HOD can only create faculty in their own department
        if (req.user.role === 'hod') {
            if (role !== 'faculty') {
                return res.status(403).json({ success: false, message: 'HOD can only create faculty accounts' });
            }
            if (department !== req.user.department) {
                return res.status(403).json({ success: false, message: 'HOD can only create faculty in their own department' });
            }
        }

        // Validate email domain
        if (!email.endsWith('@rcee.ac.in')) {
            return res.status(400).json({ success: false, message: 'Only @rcee.ac.in email addresses are allowed' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { employeeId }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this email or employee ID already exists' });
        }

        const user = await User.create({
            name, employeeId, email, password, role, department, joiningDate, mobileNumber, domain, officialEmail, address,
        });

        await logActivity({
            userId: req.user._id,
            role: req.user.role,
            action: 'Add',
            category: 'User',
            targetId: user._id,
            details: `Created ${role} account for ${name}`,
        });

        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Bulk register users from Excel file
// @route   POST /api/auth/bulk-register
exports.bulkRegister = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload an Excel file' });
        }

        const XLSX = require('xlsx');
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

        if (!rows.length) {
            return res.status(400).json({ success: false, message: 'Excel file is empty' });
        }

        const results = { created: [], skipped: [], errors: [] };
        const requiredFields = ['name', 'employeeId', 'email', 'password', 'department'];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNum = i + 2;

            // Normalize column names (case-insensitive, trim spaces)
            const data = {};
            Object.keys(row).forEach(key => {
                const k = key.trim().toLowerCase().replace(/\s+/g, '');
                if (k === 'name' || k === 'fullname') data.name = String(row[key]).trim();
                else if (k === 'employeeid' || k === 'empid') data.employeeId = String(row[key]).trim();
                else if (k === 'email') data.email = String(row[key]).trim().toLowerCase();
                else if (k === 'password') data.password = String(row[key]).trim();
                else if (k === 'role') data.role = String(row[key]).trim().toLowerCase();
                else if (k === 'department' || k === 'dept') data.department = String(row[key]).trim();
                else if (k === 'mobilenumber' || k === 'mobile' || k === 'phone') data.mobileNumber = String(row[key]).trim();
                else if (k === 'domain' || k === 'specialization') data.domain = String(row[key]).trim();
                else if (k === 'officialemail') data.officialEmail = String(row[key]).trim();
                else if (k === 'joiningdate') data.joiningDate = String(row[key]).trim();
                else if (k === 'address') data.address = String(row[key]).trim();
            });

            if (!data.role || !['faculty', 'hod'].includes(data.role)) data.role = 'faculty';

            if (req.user.role === 'hod') {
                data.role = 'faculty';
                data.department = req.user.department;
            }

            const missing = requiredFields.filter(f => !data[f]);
            if (missing.length > 0) {
                results.errors.push({ row: rowNum, name: data.name || '—', reason: `Missing: ${missing.join(', ')}` });
                continue;
            }

            // Validate email domain
            if (data.email && !data.email.endsWith('@rcee.ac.in')) {
                results.errors.push({ row: rowNum, name: data.name || '—', reason: 'Email must end with @rcee.ac.in' });
                continue;
            }

            const exists = await User.findOne({ $or: [{ email: data.email }, { employeeId: data.employeeId }] });
            if (exists) {
                results.skipped.push({ row: rowNum, name: data.name, reason: 'Email or Employee ID already exists' });
                continue;
            }

            try {
                const user = await User.create(data);
                results.created.push({ row: rowNum, name: user.name, email: user.email, department: user.department });
            } catch (err) {
                results.errors.push({ row: rowNum, name: data.name || '—', reason: err.message });
            }
        }

        await logActivity({
            userId: req.user._id,
            role: req.user.role,
            action: 'Add',
            category: 'User',
            details: `Bulk upload: ${results.created.length} created, ${results.skipped.length} skipped, ${results.errors.length} errors`,
        });

        res.json({
            success: true,
            data: results,
            summary: {
                total: rows.length,
                created: results.created.length,
                skipped: results.skipped.length,
                errors: results.errors.length,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Please provide current and new password' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.user._id).select('+password');
        const isMatch = await user.matchPassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        next(error);
    }
};
