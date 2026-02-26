const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
    },
    employeeId: {
        type: String,
        required: [true, 'Please add an employee ID'],
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false,
    },
    role: {
        type: String,
        enum: ['admin', 'hod', 'faculty'],
        default: 'faculty',
    },
    department: {
        type: String,
        required: [true, 'Please add a department'],
        trim: true,
    },
    joiningDate: {
        type: Date,
    },
    mobileNumber: {
        type: String,
        trim: true,
    },
    domain: {
        type: String,
        trim: true,
    },
    officialEmail: {
        type: String,
        trim: true,
    },
    address: {
        type: String,
        trim: true,
    },
    orcidId: {
        type: String,
        trim: true,
    },
    googleScholarUrl: {
        type: String,
        trim: true,
    },
    scopusAuthorId: {
        type: String,
        trim: true,
    },
    vidhwanId: {
        type: String,
        trim: true,
    },
    profilePicture: {
        type: String,
        default: '',
    },
    profilePicturePublicId: {
        type: String,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Hash password before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.index({ name: 'text', email: 'text', employeeId: 'text' });

module.exports = mongoose.model('User', userSchema);
