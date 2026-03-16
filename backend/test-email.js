require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('EMAIL_USER:', process.env.EMAIL_USER.trim());
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS?.trim().length, 'chars');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER.trim(),
        pass: process.env.EMAIL_PASS.trim(),
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.error('\n❌ Connection FAILED:', error.message);
    } else {
        console.log('\n✅ SMTP connection successful! Sending test email...');
        transporter.sendMail({
            from: `"RCEE RIMS Test" <${process.env.EMAIL_USER.trim()}>`,
            to: process.env.EMAIL_USER.trim(),
            subject: 'RIMS Test Email',
            text: 'This is a test email from RCEE RIMS backend.',
        }, (err, info) => {
            if (err) console.error('❌ Send failed:', err.message);
            else console.log('✅ Email sent! Message ID:', info.messageId);
        });
    }
});