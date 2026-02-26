const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const User = require('../models/User');
const Education = require('../models/Education');
const Certification = require('../models/Certification');
const Publication = require('../models/Publication');
const Patent = require('../models/Patent');
const Workshop = require('../models/Workshop');
const Seminar = require('../models/Seminar');

// @desc    Export department data as Excel
// @route   GET /api/export/excel
exports.exportExcel = async (req, res, next) => {
    try {
        const { department, academicYear } = req.query;

        let userQuery = { role: { $in: ['faculty', 'hod'] } };
        if (req.user.role === 'hod') {
            userQuery.department = req.user.department;
        } else if (department) {
            userQuery.department = department;
        }

        const faculty = await User.find(userQuery);
        const facultyIds = faculty.map((f) => f._id);

        let entryQuery = { facultyId: { $in: facultyIds } };
        if (academicYear) entryQuery.academicYear = academicYear;

        const [publications, patents, workshops] = await Promise.all([
            Publication.find(entryQuery),
            Patent.find(entryQuery),
            Workshop.find(entryQuery),
        ]);

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'RDMS';
        workbook.created = new Date();

        // Summary Sheet
        const summarySheet = workbook.addWorksheet('Summary');
        summarySheet.columns = [
            { header: 'Faculty Name', key: 'name', width: 25 },
            { header: 'Employee ID', key: 'employeeId', width: 15 },
            { header: 'Department', key: 'department', width: 15 },
            { header: 'Publications', key: 'publications', width: 15 },
            { header: 'Patents', key: 'patents', width: 12 },
            { header: 'Workshops', key: 'workshops', width: 12 },
            { header: 'Academic Year', key: 'academicYear', width: 15 },
        ];

        summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        summarySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16213E' } };

        faculty.forEach((f) => {
            const pubCount = publications.filter((p) => p.facultyId.toString() === f._id.toString()).length;
            const patCount = patents.filter((p) => p.facultyId.toString() === f._id.toString()).length;
            const wsCount = workshops.filter((w) => w.facultyId.toString() === f._id.toString()).length;

            summarySheet.addRow({
                name: f.name,
                employeeId: f.employeeId,
                department: f.department,
                publications: pubCount,
                patents: patCount,
                workshops: wsCount,
                academicYear: academicYear || 'All',
            });
        });

        // Publications Sheet
        const pubSheet = workbook.addWorksheet('Publications');
        pubSheet.columns = [
            { header: 'Faculty', key: 'faculty', width: 25 },
            { header: 'Title', key: 'title', width: 40 },
            { header: 'Journal', key: 'journal', width: 30 },
            { header: 'Type', key: 'type', width: 15 },
            { header: 'Indexed', key: 'indexed', width: 12 },
            { header: 'Year', key: 'year', width: 12 },
        ];
        pubSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        pubSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F3460' } };

        publications.forEach((p) => {
            const fac = faculty.find((f) => f._id.toString() === p.facultyId.toString());
            pubSheet.addRow({
                faculty: fac ? fac.name : 'Unknown',
                title: p.title,
                journal: p.journalName || '',
                type: p.publicationType || '',
                indexed: p.indexedType || '',
                year: p.academicYear || '',
            });
        });

        // Patents Sheet
        const patSheet = workbook.addWorksheet('Patents');
        patSheet.columns = [
            { header: 'Faculty', key: 'faculty', width: 25 },
            { header: 'Title', key: 'title', width: 40 },
            { header: 'Patent No.', key: 'patentNumber', width: 20 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Year', key: 'year', width: 12 },
        ];
        patSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        patSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F3460' } };

        patents.forEach((p) => {
            const fac = faculty.find((f) => f._id.toString() === p.facultyId.toString());
            patSheet.addRow({
                faculty: fac ? fac.name : 'Unknown',
                title: p.title,
                patentNumber: p.patentNumber || '',
                status: p.status || '',
                year: p.academicYear || '',
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=rdms_report.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        next(error);
    }
};

// @desc    Export faculty profile as PDF
// @route   GET /api/export/pdf/:facultyId
exports.exportPDF = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.facultyId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (req.user.role === 'hod' && user.department !== req.user.department) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const [education, certifications, publications, patents, workshops, seminars] = await Promise.all([
            Education.find({ facultyId: user._id }),
            Certification.find({ facultyId: user._id }),
            Publication.find({ facultyId: user._id }),
            Patent.find({ facultyId: user._id }),
            Workshop.find({ facultyId: user._id }),
            Seminar.find({ facultyId: user._id }),
        ]);

        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${user.name.replace(/\s/g, '_')}_profile.pdf`);
        doc.pipe(res);

        const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '-';

        // ---- Header ----
        doc.fontSize(20).font('Helvetica-Bold').fillColor('#16213e')
            .text(user.name, { align: 'center' });
        doc.fontSize(11).font('Helvetica').fillColor('#555')
            .text(`${user.department} Department  |  Employee ID: ${user.employeeId}`, { align: 'center' });
        doc.moveDown(1.5);

        // ---- Helper: Section Title ----
        const sectionTitle = (title) => {
            doc.moveDown(0.5);
            doc.fontSize(14).font('Helvetica-Bold').fillColor('#0f3460').text(title);
            doc.moveTo(doc.x, doc.y).lineTo(doc.x + 500, doc.y).strokeColor('#e94560').lineWidth(2).stroke();
            doc.moveDown(0.5);
        };

        // ---- Helper: Table Row ----
        const tableRow = (cols, isHeader = false) => {
            const startX = doc.x;
            const startY = doc.y;
            const colWidth = 500 / cols.length;

            if (isHeader) {
                doc.rect(startX, startY, 500, 18).fill('#16213e');
                doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9);
            } else {
                doc.fillColor('#1a1a2e').font('Helvetica').fontSize(9);
            }

            cols.forEach((col, i) => {
                doc.text(col || '-', startX + i * colWidth + 4, startY + 4, {
                    width: colWidth - 8,
                    height: 14,
                    ellipsis: true,
                });
            });

            doc.y = startY + 18;
        };

        // ---- Basic Info ----
        sectionTitle('Basic Information');
        doc.fontSize(10).font('Helvetica').fillColor('#1a1a2e');
        const info = [
            ['Email', user.email, 'Mobile', user.mobileNumber || '-'],
            ['Domain', user.domain || '-', 'Joining Date', formatDate(user.joiningDate)],
            ['Official Email', user.officialEmail || '-', 'Address', user.address || '-'],
        ];
        info.forEach((row) => {
            doc.font('Helvetica-Bold').text(`${row[0]}: `, { continued: true })
                .font('Helvetica').text(`${row[1]}     `, { continued: true })
                .font('Helvetica-Bold').text(`${row[2]}: `, { continued: true })
                .font('Helvetica').text(row[3]);
        });

        // ---- Research Profile IDs ----
        const researchIds = [];
        if (user.orcidId) researchIds.push(['ORCID', user.orcidId]);
        if (user.googleScholarUrl) researchIds.push(['Google Scholar', user.googleScholarUrl]);
        if (user.scopusAuthorId) researchIds.push(['Scopus Author ID', user.scopusAuthorId]);
        if (user.vidhwanId) researchIds.push(['Vidwan ID', user.vidhwanId]);

        if (researchIds.length > 0) {
            doc.moveDown(0.5);
            doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f3460').text('Research Profile Links');
            doc.moveDown(0.3);
            researchIds.forEach(([label, value]) => {
                doc.fontSize(10).font('Helvetica-Bold').fillColor('#1a1a2e').text(`${label}: `, { continued: true })
                    .font('Helvetica').text(value);
            });
        }

        // ---- Education ----
        sectionTitle('Education');
        if (education.length > 0) {
            tableRow(['Degree', 'University', 'Specialization', 'Year'], true);
            education.forEach((e) => tableRow([e.degree, e.university, e.specialization, e.year]));
        } else {
            doc.fontSize(10).fillColor('#999').text('No education records');
        }

        // ---- Certifications ----
        sectionTitle('Certifications');
        if (certifications.length > 0) {
            tableRow(['Title', 'Issued By', 'Date', 'Credential ID'], true);
            certifications.forEach((c) => tableRow([c.title, c.issuedBy, formatDate(c.date), c.credentialId]));
        } else {
            doc.fontSize(10).fillColor('#999').text('No certifications');
        }

        // ---- Publications ----
        if (doc.y > 650) doc.addPage();
        sectionTitle('Publications');
        if (publications.length > 0) {
            tableRow(['Title', 'Journal', 'Type', 'Indexed', 'DOI', 'Year'], true);
            publications.forEach((p) => {
                if (doc.y > 700) doc.addPage();
                tableRow([p.title, p.journalName, p.publicationType, p.indexedType, p.doi, p.academicYear]);
                // Additional details row
                const details = [];
                if (p.issn) details.push(`ISSN: ${p.issn}`);
                if (p.volume) details.push(`Vol: ${p.volume}`);
                if (p.researchDomain) details.push(`Domain: ${p.researchDomain}`);
                if (details.length > 0) {
                    doc.fontSize(8).font('Helvetica-Oblique').fillColor('#666').text(`  ${details.join('  |  ')}`);
                    doc.moveDown(0.2);
                }
            });
        } else {
            doc.fontSize(10).fillColor('#999').text('No publications');
        }

        // ---- Patents ----
        if (doc.y > 650) doc.addPage();
        sectionTitle('Patents');
        if (patents.length > 0) {
            tableRow(['Title', 'Patent No.', 'Status', 'Filing Date', 'Grant Date', 'Year'], true);
            patents.forEach((p) => {
                if (doc.y > 720) doc.addPage();
                tableRow([p.title, p.patentNumber, p.status, formatDate(p.filingDate), formatDate(p.grantDate), p.academicYear]);
            });
        } else {
            doc.fontSize(10).fillColor('#999').text('No patents');
        }

        // ---- Workshops ----
        if (doc.y > 650) doc.addPage();
        sectionTitle('Workshops');
        if (workshops.length > 0) {
            tableRow(['Title', 'Institution', 'Role', 'Date', 'Year'], true);
            workshops.forEach((w) => {
                if (doc.y > 720) doc.addPage();
                tableRow([w.title, w.institution, w.role, formatDate(w.date), w.academicYear]);
            });
        } else {
            doc.fontSize(10).fillColor('#999').text('No workshops');
        }

        // ---- Seminars ----
        if (doc.y > 650) doc.addPage();
        sectionTitle('Seminars');
        if (seminars.length > 0) {
            tableRow(['Topic', 'Institution', 'Role', 'Date', 'Year'], true);
            seminars.forEach((s) => {
                if (doc.y > 720) doc.addPage();
                tableRow([s.topic, s.institution, s.role, formatDate(s.date), s.academicYear]);
            });
        } else {
            doc.fontSize(10).fillColor('#999').text('No seminars');
        }

        doc.end();
    } catch (error) {
        next(error);
    }
};

// @desc    Export NAAC-formatted report
// @route   GET /api/export/naac
exports.exportNAAC = async (req, res, next) => {
    try {
        const { department, academicYear } = req.query;

        let userQuery = { role: { $in: ['faculty', 'hod'] } };
        if (req.user.role === 'hod') {
            userQuery.department = req.user.department;
        } else if (department) {
            userQuery.department = department;
        }

        const faculty = await User.find(userQuery);
        const facultyIds = faculty.map((f) => f._id);
        const facultyMap = {};
        faculty.forEach((f) => { facultyMap[f._id.toString()] = f; });

        let entryQuery = { facultyId: { $in: facultyIds } };
        if (academicYear) entryQuery.academicYear = academicYear;

        const [publications, patents, workshops, seminars] = await Promise.all([
            Publication.find(entryQuery).populate('facultyId', 'name department').lean(),
            Patent.find(entryQuery).populate('facultyId', 'name department').lean(),
            Workshop.find(entryQuery).populate('facultyId', 'name department').lean(),
            Seminar.find(entryQuery).populate('facultyId', 'name department').lean(),
        ]);

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'RDMS - NAAC Report';
        workbook.created = new Date();

        const headerStyle = { font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } }, alignment: { horizontal: 'center', wrapText: true } };

        // --- Criterion 3.4.3: Publications ---
        const pubSheet = workbook.addWorksheet('3.4.3 Publications');
        pubSheet.columns = [
            { header: 'S.No', key: 'sno', width: 6 },
            { header: 'Title of Paper', key: 'title', width: 35 },
            { header: 'Name of Author(s)', key: 'author', width: 25 },
            { header: 'Department', key: 'department', width: 20 },
            { header: 'Name of Journal', key: 'journal', width: 30 },
            { header: 'Year of Publication', key: 'year', width: 15 },
            { header: 'ISSN Number', key: 'issn', width: 15 },
            { header: 'Indexed In', key: 'indexed', width: 15 },
            { header: 'Link to Article/DOI', key: 'doi', width: 25 },
        ];
        pubSheet.getRow(1).eachCell((cell) => { Object.assign(cell, headerStyle); });
        publications.forEach((pub, i) => {
            pubSheet.addRow({
                sno: i + 1,
                title: pub.title,
                author: pub.facultyId?.name || '',
                department: pub.facultyId?.department || '',
                journal: pub.journalName || '',
                year: pub.academicYear || '',
                issn: pub.issnNumber || '',
                indexed: pub.indexedType || '',
                doi: pub.doi || pub.fileUrl || '',
            });
        });

        // --- Criterion 3.4.4: Patents ---
        const patSheet = workbook.addWorksheet('3.4.4 Patents');
        patSheet.columns = [
            { header: 'S.No', key: 'sno', width: 6 },
            { header: 'Title of Patent', key: 'title', width: 35 },
            { header: 'Name of Patentee(s)', key: 'patentee', width: 25 },
            { header: 'Department', key: 'department', width: 20 },
            { header: 'Patent Number', key: 'patentNo', width: 18 },
            { header: 'Status', key: 'status', width: 12 },
            { header: 'Filing Date', key: 'filingDate', width: 15 },
            { header: 'Academic Year', key: 'year', width: 15 },
        ];
        patSheet.getRow(1).eachCell((cell) => { Object.assign(cell, headerStyle); });
        patents.forEach((pat, i) => {
            patSheet.addRow({
                sno: i + 1,
                title: pat.title,
                patentee: pat.facultyId?.name || '',
                department: pat.facultyId?.department || '',
                patentNo: pat.patentNumber || '',
                status: pat.status || '',
                filingDate: pat.filingDate ? new Date(pat.filingDate).toLocaleDateString('en-IN') : '',
                year: pat.academicYear || '',
            });
        });

        // --- Criterion 3.4.5: Workshops/Seminars ---
        const wsSheet = workbook.addWorksheet('3.4.5 Workshops & Seminars');
        wsSheet.columns = [
            { header: 'S.No', key: 'sno', width: 6 },
            { header: 'Title/Topic', key: 'title', width: 35 },
            { header: 'Name of Faculty', key: 'faculty', width: 25 },
            { header: 'Department', key: 'department', width: 20 },
            { header: 'Type', key: 'type', width: 12 },
            { header: 'Role', key: 'role', width: 15 },
            { header: 'Institution/Venue', key: 'institution', width: 25 },
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Academic Year', key: 'year', width: 15 },
        ];
        wsSheet.getRow(1).eachCell((cell) => { Object.assign(cell, headerStyle); });
        let sno = 1;
        workshops.forEach((ws) => {
            wsSheet.addRow({
                sno: sno++,
                title: ws.title,
                faculty: ws.facultyId?.name || '',
                department: ws.facultyId?.department || '',
                type: 'Workshop',
                role: ws.role || '',
                institution: ws.institution || '',
                date: ws.date ? new Date(ws.date).toLocaleDateString('en-IN') : '',
                year: ws.academicYear || '',
            });
        });
        seminars.forEach((sem) => {
            wsSheet.addRow({
                sno: sno++,
                title: sem.topic,
                faculty: sem.facultyId?.name || '',
                department: sem.facultyId?.department || '',
                type: 'Seminar',
                role: sem.role || '',
                institution: sem.institution || '',
                date: sem.date ? new Date(sem.date).toLocaleDateString('en-IN') : '',
                year: sem.academicYear || '',
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=NAAC_Report.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        next(error);
    }
};
