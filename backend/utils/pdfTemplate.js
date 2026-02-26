const generateProfileHTML = (user, data) => {
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '-';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; color: #1a1a2e; }
    h1 { text-align: center; color: #16213e; margin-bottom: 5px; font-size: 22px; }
    .subtitle { text-align: center; color: #555; margin-bottom: 30px; font-size: 13px; }
    h2 { color: #0f3460; border-bottom: 2px solid #e94560; padding-bottom: 5px; margin: 25px 0 12px; font-size: 16px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 12px; }
    th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
    th { background: #16213e; color: #fff; font-weight: 600; }
    tr:nth-child(even) { background: #f8f9fa; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 15px; font-size: 13px; }
    .info-item span:first-child { font-weight: 600; color: #0f3460; }
    .no-data { color: #999; font-style: italic; font-size: 12px; }
  </style>
</head>
<body>
  <h1>${user.name}</h1>
  <p class="subtitle">${user.department} Department | Employee ID: ${user.employeeId}</p>

  <h2>Basic Information</h2>
  <div class="info-grid">
    <div class="info-item"><span>Email: </span><span>${user.email}</span></div>
    <div class="info-item"><span>Mobile: </span><span>${user.mobileNumber || '-'}</span></div>
    <div class="info-item"><span>Domain: </span><span>${user.domain || '-'}</span></div>
    <div class="info-item"><span>Joining Date: </span><span>${formatDate(user.joiningDate)}</span></div>
    <div class="info-item"><span>Official Email: </span><span>${user.officialEmail || '-'}</span></div>
    <div class="info-item"><span>Address: </span><span>${user.address || '-'}</span></div>
  </div>

  <h2>Education</h2>
  ${data.education.length > 0 ? `
  <table>
    <tr><th>Degree</th><th>University</th><th>Specialization</th><th>Year</th></tr>
    ${data.education.map(e => `<tr><td>${e.degree}</td><td>${e.university}</td><td>${e.specialization || '-'}</td><td>${e.year || '-'}</td></tr>`).join('')}
  </table>` : '<p class="no-data">No education records</p>'}

  <h2>Certifications</h2>
  ${data.certifications.length > 0 ? `
  <table>
    <tr><th>Title</th><th>Issued By</th><th>Date</th><th>Credential ID</th></tr>
    ${data.certifications.map(c => `<tr><td>${c.title}</td><td>${c.issuedBy}</td><td>${formatDate(c.date)}</td><td>${c.credentialId || '-'}</td></tr>`).join('')}
  </table>` : '<p class="no-data">No certifications</p>'}

  <h2>Publications</h2>
  ${data.publications.length > 0 ? `
  <table>
    <tr><th>Title</th><th>Journal</th><th>Type</th><th>Indexed</th><th>Year</th></tr>
    ${data.publications.map(p => `<tr><td>${p.title}</td><td>${p.journalName || '-'}</td><td>${p.publicationType || '-'}</td><td>${p.indexedType || '-'}</td><td>${p.academicYear || '-'}</td></tr>`).join('')}
  </table>` : '<p class="no-data">No publications</p>'}

  <h2>Patents</h2>
  ${data.patents.length > 0 ? `
  <table>
    <tr><th>Title</th><th>Patent No.</th><th>Status</th><th>Filing Date</th><th>Year</th></tr>
    ${data.patents.map(p => `<tr><td>${p.title}</td><td>${p.patentNumber || '-'}</td><td>${p.status || '-'}</td><td>${formatDate(p.filingDate)}</td><td>${p.academicYear || '-'}</td></tr>`).join('')}
  </table>` : '<p class="no-data">No patents</p>'}

  <h2>Workshops</h2>
  ${data.workshops.length > 0 ? `
  <table>
    <tr><th>Title</th><th>Institution</th><th>Role</th><th>Date</th><th>Year</th></tr>
    ${data.workshops.map(w => `<tr><td>${w.title}</td><td>${w.institution || '-'}</td><td>${w.role || '-'}</td><td>${formatDate(w.date)}</td><td>${w.academicYear || '-'}</td></tr>`).join('')}
  </table>` : '<p class="no-data">No workshops</p>'}

  <h2>Seminars</h2>
  ${data.seminars.length > 0 ? `
  <table>
    <tr><th>Topic</th><th>Institution</th><th>Role</th><th>Date</th><th>Year</th></tr>
    ${data.seminars.map(s => `<tr><td>${s.topic}</td><td>${s.institution || '-'}</td><td>${s.role || '-'}</td><td>${formatDate(s.date)}</td><td>${s.academicYear || '-'}</td></tr>`).join('')}
  </table>` : '<p class="no-data">No seminars</p>'}
</body>
</html>`;
};

module.exports = generateProfileHTML;
