# RCEE RIMS — Project Info & Features Documentation

> **RCEE Research Information Management System**  
> Ramachandra College of Engineering, Eluru  
> Version 2.0.0 | MERN Stack

---

## 📋 Project Overview

RCEE RIMS is a full-stack web application built for Ramachandra College of Engineering to digitally manage faculty research output. It allows faculty to maintain their research profiles (publications, patents, workshops, seminars, certifications, education) and enables Admin/HOD to monitor, compare, export and broadcast announcements to all departments.

The system enforces strict **role-based access control** — faculty can only edit their own data, HODs manage their own department, and Admins have global visibility.

---

## 🏛️ Architecture

```
┌──────────────┐    HTTP/REST (JSON)    ┌──────────────┐    Mongoose ODM    ┌──────────────┐
│  React SPA   │ ◄────────────────────► │  Express API │ ◄────────────────► │  MongoDB     │
│  (Vite)      │    JWT Auth Header     │  (Node.js)   │                    │  (Atlas)     │
└──────────────┘                        └──────┬───────┘                    └──────────────┘
                                               │
                             ┌─────────────────┼──────────────────┐
                             │                 │                  │
                      Multer Upload      Nodemailer           PDFKit/xlsx
                             │            Gmail SMTP           Exports
                      ┌──────▼──────┐
                      │   memory/   │
                      │ publications│
                      │ /2026/cse/  │
                      │  patents/   │
                      │ /2026/ece/  │
                      └─────────────┘
```

---

## ✅ Features (Current — v2.0.0)

### 1. Authentication & Authorization

- [x] JWT-based login (token stored in localStorage)
- [x] Auto-logout on token expiry (401 interceptor in Axios)
- [x] Role-based route protection: Admin, HOD, Faculty
- [x] Password hashing with bcryptjs (salt rounds: 10)
- [x] **Forgot Password** — email reset link (expires 15 min, SHA-256 hashed token in DB)
- [x] **Distinct login error messages** — "no account found" vs "wrong password"
- [x] Login accepts any valid email (no domain restriction enforced)

### 2. User Management

- [x] Admin/HOD create faculty accounts (single form)
- [x] **Bulk Upload** — CSV/Excel → batch create accounts; skips duplicates, error per row
- [x] **Welcome Email** — auto-sent on account creation with login credentials
- [x] Profile: name, employeeId, email (official), personalEmail, department, mobile, domain, joining date, address, ORCID, Google Scholar, Scopus, Vidhwan, ResearchGate, LinkedIn
- [x] **Profile picture** — file upload or live camera capture
- [x] Admin/HOD can delete users; bulk delete with checkboxes
- [x] **Password Reset by Admin/HOD** via modal
- [x] Faculty can only edit own profile (strict ownership)
- [x] HOD restricted to own department

### 3. Dashboard & Analytics

- [x] 6 stat cards: Faculty, Publications, Patents, Workshops, Seminars, Certifications
- [x] Department-wise bar chart (Recharts)
- [x] Academic year filter (auto-generated from 2020-21 → current+next)
- [x] Admin can filter by department; HOD auto-scoped
- [x] **Department Comparison** (Admin only) — radar chart + bar chart + stat table for any 2 departments

### 4. Faculty Profile Page

- [x] Profile header: avatar, name, department, employeeId, role badge
- [x] 7 accordion sections: Basic Info, Education, Certifications, Publications, Patents, Workshops, Seminars
- [x] CRUD modals (Add/Edit/Delete) for all sections with file upload
- [x] Academic year filter on all research sections
- [x] **PDF download** — full profile with RCEE logo, profile photo, research tables
- [x] **Strict ownership** — faculty can only edit own entries; no admin/HOD bypass

### 5. Research Data Collections (6 types)

| Category | Key Fields |
|---|---|
| **Education** | degree, university, specialization, year |
| **Certifications** | title, issuedBy, date, credentialId, fileUrl |
| **Publications** | title, journalName, ISSN, DOI, publicationType, indexedType, academicYear, fileUrl |
| **Patents** | title, patentNumber, status (Filed/Published/Granted), filingDate, grantDate, academicYear, fileUrl |
| **Workshops** | title, institution, role (Organized/Attended), date, academicYear, certificateUrl |
| **Seminars** | topic, institution, role, date, academicYear |

### 6. File Storage — Year + Department Based

```
memory/
├── publications/YEAR/DEPT/EMPID_timestamp_random_filename.pdf
├── patents/YEAR/DEPT/...
├── workshops/YEAR/DEPT/...
├── certifications/YEAR/DEPT/...
└── profile-pictures/YEAR/DEPT/...
```

- Folders auto-created on first upload (`fs.mkdirSync recursive`)
- Year derived from upload date (`new Date().getFullYear()`)
- New year folders created automatically without any code change
- Files served via Express static: `/uploads/category/year/dept/file`

### 7. Email Service (Nodemailer + Gmail)

| Email Type | Trigger | Details |
|---|---|---|
| **Welcome** | New account created | Name, email, dept, role, password, login link |
| **Password Reset** | Forgot password request | Secure link with 15-min expiry |
| **Broadcast** | Admin sends notification with email toggle | Sent via BCC to all recipients |

- Gmail SMTP (port 465, SSL) with App Password
- RCEE logo embedded as **CID inline attachment** (shows in Gmail/Outlook)
- **Auto-detected LAN IP** for reset links — works on any network

### 8. Notification System

- [x] Admin/HOD send in-app broadcast (target: all / department)
- [x] **Email toggle** — optionally send email alongside in-app notification
- [x] In-app notification bell with unread count badge
- [x] Mark as read / mark all as read

### 9. Export Features

- [x] **PDF** (per faculty) — PDFKit: RCEE letterhead, profile photo, research tables, page numbers
- [x] **Excel** — multi-sheet workbook (Summary, Publications, Patents)
- [x] **NAAC Report** — department-wise formatted Excel

### 10. Rankings (Count-Based)

- Rankings based on **total upload count** across all research categories (not score points)
- College Top 5 + Department Top 3 leaderboard
- Optimized with `Promise.all` — no N+1 queries

### 11. Academic Year Auto-Management

- `autoSeedAcademicYears.js` runs on every server startup
- **First run (empty DB):** seeds 2020-21 → current year + next year
- **Subsequent runs:** only adds new years if missing
- No manual action ever needed when a new academic year begins

### 12. Activity Logging

- All Add, Update, Delete actions auto-logged
- Fields: userId, role, action, category, targetId, details, timestamp
- Admin-only Activity Logs page with filter (action, category, date range)

### 13. Security

- JWT on all protected routes; role-based `authorize()` middleware
- Faculty strict self-ownership for all uploads and data edits
- HOD department-scoped in all controllers
- File type validation (PDF, JPG, JPEG, PNG)
- File size limit: 10 MB (env configurable)
- CORS permissive for LAN access (restrict in production)
- Reset tokens stored as SHA-256 hash — raw token only in email link

---

## 📊 Database Collections

| Collection | Key Fields |
|---|---|
| **Users** | name, employeeId, email, password (hashed), role, department, profilePicture, personalEmail, researchGateUrl, linkedinUrl, resetPasswordToken, resetPasswordExpire |
| **Education** | degree, university, specialization, year, facultyId |
| **Certifications** | title, issuedBy, date, credentialId, fileUrl, facultyId |
| **Publications** | title, journalName, issn, doi, publicationType, indexedType, academicYear, fileUrl, facultyId |
| **Patents** | title, patentNumber, status, filingDate, grantDate, academicYear, fileUrl, facultyId |
| **Workshops** | title, institution, role, date, academicYear, certificateUrl, facultyId |
| **Seminars** | topic, institution, role, date, academicYear, facultyId |
| **AcademicYears** | label (e.g. "2025-26"), order, isActive |
| **ActivityLogs** | userId, role, action, category, targetId, details, timestamp |
| **Notifications** | userId, message, type, category, link, read |

---

## ⚙️ Environment Variables

`backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/dbname
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
MAX_FILE_SIZE=10485760
EMAIL_USER=rcee.rims@gmail.com
EMAIL_PASS=your_16char_app_password
VITE_FRONTEND_PORT=5173
```

`frontend/.env`:

```env
VITE_API_URL=/api
VITE_PORT=5173
```

---

## 🔢 Version History

| Version | Date | Key Changes |
|---|---|---|
| 1.0.0 | Feb 2026 | Initial release: CRUD, dashboard, exports, activity logs, profile picture |
| 1.1.0 | Feb 2026 | Password reset (Admin/HOD), notifications, PDF redesign, bulk upload, start.bat |
| 2.0.0 | Mar 2026 | Email service (welcome + reset + broadcast), dept+year file storage, dept comparison, count-based rankings, auto academic years, personal email field, ResearchGate/LinkedIn, LAN access, login error messages, RCEE RIMS rebrand |

---

## 👨‍💻 Developer Notes

- Backend uses **separate MongoDB collections** per research type (not embedded) for scalability
- File storage is **local disk** — served via Express static `/uploads/`
- **`memory/` folder is gitignored** — contains uploaded files, not source
- Academic years auto-seeded by `utils/autoSeedAcademicYears.js` on every startup
- PDF export reads profile pictures directly from disk path (no HTTP call needed)
- HOD department scoping enforced at **controller level** on every query
- Activity logging called explicitly in controllers (not Mongoose hooks) for control
- Email uses **CID inline attachment** for logo — works in Gmail/Outlook/mobile
