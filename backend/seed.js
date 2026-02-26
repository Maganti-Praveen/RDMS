const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const AcademicYear = require('./models/AcademicYear');
const ScoreConfig = require('./models/ScoreConfig');

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Seed Admin
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('Admin user already exists:', existingAdmin.email);
        } else {
            const admin = await User.create({
                name: 'System Admin',
                employeeId: 'ADMIN001',
                email: 'admin@rcee.ac.in',
                password: 'admin123',
                role: 'admin',
                department: 'Administration',
            });
            console.log('Admin user created successfully:');
            console.log(`  Email: ${admin.email}`);
            console.log('  Password: admin123');
        }

        // Seed Academic Years
        const existingYears = await AcademicYear.countDocuments();
        if (existingYears === 0) {
            const years = [
                { label: '2020-21', order: 1, isActive: false },
                { label: '2021-22', order: 2, isActive: false },
                { label: '2022-23', order: 3, isActive: false },
                { label: '2023-24', order: 4, isActive: false },
                { label: '2024-25', order: 5, isActive: true },
                { label: '2025-26', order: 6, isActive: true },
            ];
            await AcademicYear.insertMany(years);
            console.log(`Seeded ${years.length} academic years`);
        } else {
            console.log(`Academic years already exist (${existingYears} found)`);
        }

        // Seed Score Config
        const existingConfigs = await ScoreConfig.countDocuments();
        if (existingConfigs === 0) {
            const configs = [
                { category: 'publication', subCategory: 'SCI', points: 10, description: 'SCI Indexed Journal' },
                { category: 'publication', subCategory: 'Scopus', points: 7, description: 'Scopus Indexed Journal' },
                { category: 'publication', subCategory: 'UGC', points: 3, description: 'UGC Approved Journal' },
                { category: 'publication', subCategory: 'SEI', points: 4, description: 'SEI Indexed' },
                { category: 'publication', subCategory: 'Conference', points: 5, description: 'Conference Paper' },
                { category: 'publication', subCategory: 'Book', points: 8, description: 'Book Publication' },
                { category: 'publication', subCategory: 'Chapter', points: 4, description: 'Book Chapter' },
                { category: 'publication', subCategory: 'Other', points: 2, description: 'Other Publication' },
                { category: 'patent', subCategory: 'Granted', points: 15, description: 'Patent Granted' },
                { category: 'patent', subCategory: 'Published', points: 10, description: 'Patent Published' },
                { category: 'patent', subCategory: 'Filed', points: 5, description: 'Patent Filed' },
                { category: 'patent', subCategory: 'Utility', points: 8, description: 'Utility Patent' },
                { category: 'workshop', subCategory: 'Organized', points: 5, description: 'Workshop Organized' },
                { category: 'workshop', subCategory: 'Attended', points: 2, description: 'Workshop Attended' },
                { category: 'seminar', subCategory: 'Presented', points: 3, description: 'Seminar Presented' },
                { category: 'certification', subCategory: 'Completed', points: 2, description: 'Certification Completed' },
            ];
            await ScoreConfig.insertMany(configs);
            console.log(`Seeded ${configs.length} score configurations`);
        } else {
            console.log(`Score configs already exist (${existingConfigs} found)`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error.message);
        process.exit(1);
    }
};

seed();
