const nodemailer = require('nodemailer');
const os = require('os');
const path = require('path');
const fs = require('fs');

// Auto-detect local network IP (works on any WiFi/network)
const getLocalIP = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
};

const getFrontendUrl = () => {
    const port = process.env.VITE_FRONTEND_PORT || 5173;
    return `http://${getLocalIP()}:${port}`;
};

// Logo path for CID inline attachment
const logoPath = path.join(__dirname, '../logo/rcee.png');
const hasLogo = fs.existsSync(logoPath);

// Inline attachment definition (reused across all emails)
const logoAttachment = hasLogo ? [{
    filename: 'rcee.png',
    path: logoPath,
    cid: 'rceelogo',          // referenced as src="cid:rceelogo" in HTML
    contentDisposition: 'inline',
}] : [];

// Shared header — uses cid: reference which all email clients support
const emailHeader = `
  <div style="background:#ffffff; padding:0; text-align:center;">
    ${hasLogo
        ? `<img src="cid:rceelogo" alt="RCEE RIMS" style="width:100%; max-width:600px; height:auto; display:block; margin:0 auto;" />`
        : `<div style="padding:20px; background:#1E3A8A; color:white;"><h2 style="margin:0;">RCEE RIMS</h2><p style="margin:5px 0 0;color:#bfdbfe;">Research Information Management System</p></div>`
    }
  </div>`;

const emailFooter = `
  <div style="background:#f0f0f0; padding:15px; text-align:center; font-size:12px; color:#666;">
    Support: rcee.rims@gmail.com
  </div>`;

// Create transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ─── Welcome Email ──────────────────────────────────────────────
exports.sendWelcomeEmail = async (user, plainPassword) => {
    const loginUrl = getFrontendUrl();
    const html = `
<div style="font-family: Arial, sans-serif; background:#f5f7fb; padding:30px;">
  <div style="max-width:600px; margin:auto; background:white; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    ${emailHeader}
    <div style="padding:30px; color:#333;">
      <h3>Welcome ${user.name},</h3>
      <p>Your account has been successfully created in the <b>RCEE Research Information Management System (RIMS)</b>.</p>
      <p>Please find your login details below:</p>
      <table style="width:100%; border-collapse:collapse; margin:20px 0;">
        <tr><td style="padding:8px; border:1px solid #ddd;"><b>Name</b></td><td style="padding:8px; border:1px solid #ddd;">${user.name}</td></tr>
        <tr><td style="padding:8px; border:1px solid #ddd;"><b>Email</b></td><td style="padding:8px; border:1px solid #ddd;">${user.email}</td></tr>
        <tr><td style="padding:8px; border:1px solid #ddd;"><b>Department</b></td><td style="padding:8px; border:1px solid #ddd;">${user.department}</td></tr>
        <tr><td style="padding:8px; border:1px solid #ddd;"><b>Role</b></td><td style="padding:8px; border:1px solid #ddd;">${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</td></tr>
        <tr><td style="padding:8px; border:1px solid #ddd;"><b>Password</b></td><td style="padding:8px; border:1px solid #ddd;">${plainPassword}</td></tr>
      </table>
      <p>You can login to the system using the link below:</p>
      <div style="text-align:center; margin:25px 0;">
        <a href="${loginUrl}" style="background:#F97316; color:white; padding:12px 25px; text-decoration:none; border-radius:5px; font-weight:bold;">Login to RIMS</a>
      </div>
      <p>After logging in, please update your profile and add your research details such as publications, patents, workshops, and seminars.</p>
      <br>
      <p>Regards,<br><b>RCEE RIMS Administration</b><br>Ramachandra College of Engineering</p>
    </div>
    ${emailFooter}
  </div>
</div>`;

    await transporter.sendMail({
        from: `"RCEE RIMS" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Welcome to RCEE RIMS – Your Account Details',
        html,
        attachments: logoAttachment,
    });
};

// ─── Password Reset Email ──────────────────────────────────────
exports.sendPasswordResetEmail = async (user, resetToken) => {
    const frontendUrl = getFrontendUrl();
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
    const html = `
<div style="font-family: Arial, sans-serif; background:#f5f7fb; padding:30px;">
  <div style="max-width:600px; margin:auto; background:white; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    ${emailHeader}
    <div style="padding:30px; color:#333;">
      <h3>Hello ${user.name},</h3>
      <p>A request has been received to reset the password for your account in the <b>RCEE Research Information Management System</b>.</p>
      <p>Please click the button below to set a new password:</p>
      <div style="text-align:center; margin:25px 0;">
        <a href="${resetLink}" style="background:#F97316; color:white; padding:12px 25px; text-decoration:none; border-radius:5px; font-weight:bold;">Reset Password</a>
      </div>
      <p>This link will expire in <b>15 minutes</b>.</p>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
      <br>
      <p>Regards,<br><b>RCEE RIMS Support Team</b><br>Ramachandra College of Engineering</p>
    </div>
    ${emailFooter}
  </div>
</div>`;

    await transporter.sendMail({
        from: `"RCEE RIMS" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'RCEE RIMS – Password Reset Request',
        html,
        attachments: logoAttachment,
    });
};

// ─── Broadcast Email ───────────────────────────────────────────
exports.sendBroadcastEmail = async (recipients, title, message) => {
    const html = `
<div style="font-family: Arial, sans-serif; background:#f5f7fb; padding:30px;">
  <div style="max-width:600px; margin:auto; background:white; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    ${emailHeader}
    <div style="padding:30px; color:#333;">
      ${title ? `<h3 style="color:#1E3A8A;">${title}</h3>` : ''}
      <p style="font-size:15px; line-height:1.7;">${message.replace(/\n/g, '<br>')}</p>
      <br>
      <p>Regards,<br><b>RCEE RIMS Administration</b><br>Ramachandra College of Engineering</p>
    </div>
    ${emailFooter}
  </div>
</div>`;

    await transporter.sendMail({
        from: `"RCEE RIMS" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        bcc: recipients.map(r => r.email),
        subject: title ? `RCEE RIMS – ${title}` : 'RCEE RIMS – Announcement',
        html,
        attachments: logoAttachment,
    });
};
