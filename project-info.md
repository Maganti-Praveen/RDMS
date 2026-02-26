# RDMS – Project Info & Features Documentation

> **Research & Department Management System**
> Version 1.0.0 | Built with MERN Stack

---

## 📋 Project Overview

RDMS is a comprehensive web application designed for educational institutions to digitally manage faculty research profiles, track publications, patents, workshops, seminars, certifications, and generate NAAC-compliant institutional reports. The system supports three user roles — **Admin**, **HOD**, and **Faculty** — each with fine-grained access control.

---

## 🏛️ Architecture

```
┌──────────────┐     HTTP/REST      ┌──────────────┐     Mongoose     ┌──────────────┐
│   React SPA  │ ◄─────────────────► │  Express API │ ◄──────────────► │  MongoDB     │
│   (Vite)     │    JWT Auth         │  (Node.js)   │                  │  (Atlas)     │
└──────────────┘                     └──────┬───────┘                  └──────────────┘
                                            │
                                     Cloudinary SDK
                                            │
                                     ┌──────▼───────┐
                                     │  Cloudinary   │
                                     │  (File Store) │
                                     └──────────────┘
```

- **Frontend**: React 18 with Vite build tool, Tailwind CSS for styling
- **Backend**: Express.js REST API with JWT authentication
- **Database**: MongoDB Atlas with Mongoose ODM (8 collections)
- **File Storage**: Cloudinary for PDFs, certificates, and profile pictures
- **Exports**: ExcelJS for spreadsheet reports, PDFKit for PDF generation

---

## ✅ Features Implemented

### 1. Authentication & Authorization

- [x] JWT-based login with bcrypt password hashing
- [x] Token stored in localStorage, auto-attached via Axios interceptor
- [x] Auto-logout on 401 (expired/invalid token)
- [x] Role-based route protection (Admin, HOD, Faculty)
- [x] Password field hidden with `select: false` in schema
- [x] Admin-only user registration

### 2. User Management

- [x] Admin can create Faculty and HOD accounts
- [x] Full user fields: name, employeeId, email, password, role, department, mobileNumber, domain, officialEmail, joiningDate, address
- [x] Profile picture upload via file or live camera capture
- [x] Profile picture stored on Cloudinary with auto face-crop
- [x] Admin can delete users
- [x] Faculty can update their own profile
- [x] HOD restricted to viewing own department users
- [x] 15 departments supported (CSE, ECE, EEE, ME, CE, IT, AIDS, AIML, MBA, MCA, Physics, Chemistry, Mathematics, English, Administration)

### 3. Dashboard & Analytics

- [x] 6 statistics cards: Faculty, Publications, Patents, Workshops, Seminars, Certifications
- [x] Department-wise research output bar chart (Recharts)
- [x] Filter by academic year (2020-21 through 2025-26)
- [x] Admin can filter by department
- [x] HOD dashboard auto-scoped to their department
- [x] Real-time data from aggregated database queries

### 4. Faculty Profile Page

- [x] Profile header with avatar, name, department, employee ID, role badge
- [x] Profile picture with camera capture and file upload
- [x] 7 accordion sections: Basic Info, Education, Certifications, Publications, Patents, Workshops, Seminars
- [x] Tabular display for all research entries
- [x] CRUD operations via modal forms (Add/Edit/Delete)
- [x] File upload for certifications, publications, patents, workshops
- [x] External link to uploaded files (opens in new tab)
- [x] Academic year filter across all sections
- [x] PDF download of complete faculty profile
- [x] Role-based edit permissions (self, admin)

### 5. Data Collections (6 Research Types)

#### Education

- Fields: degree, university, specialization, year
- Scoped by facultyId

#### Certifications

- Fields: title, issuedBy, date, credentialId, fileUrl
- Cloudinary file upload (PDF/Image)

#### Publications

- Fields: title, journalName, issn, volume, doi, publicationType, indexedType, academicYear, publicationDate, fileUrl
- Types: Journal, Conference, Book, Chapter
- Indexed: SCI, Scopus, SEI, UGC, Other
- Filtering by department, academic year, type, indexed status

#### Patents

- Fields: title, patentNumber, status, filingDate, grantDate, academicYear, fileUrl
- Status: Filed, Published, Granted, Utility
- Filtering by department, academic year, status

#### Workshops

- Fields: title, institution, role, date, academicYear, certificateUrl
- Role: Organized, Attended
- Filtering by department, academic year, role

#### Seminars

- Fields: topic, institution, role, date, academicYear
- Filtering by department, academic year

### 6. Export Features

- [x] **Excel Export**: Multi-sheet workbook via ExcelJS
  - Sheet 1: Summary (faculty count, totals per category)
  - Sheet 2: Publications (all details with faculty name)
  - Sheet 3: Patents (all details with faculty name)
  - Filterable by department
  - Admin/HOD access only
- [x] **PDF Export**: Individual faculty profile via PDFKit
  - NAAC-style format with tables
  - Includes all 6 research sections
  - Available to all roles (own profile)

### 7. Activity Logging

- [x] All Add, Update, Delete operations automatically logged
- [x] Logs stored with: userId, role, action, category, targetId, details, timestamp
- [x] Admin-only Activity Logs page
- [x] Filtering by action (Add/Update/Delete), category (7 types), date range
- [x] Pagination (20 per page)
- [x] Populated user details for each log entry

### 8. Filtering System

- [x] Dashboard: department + academic year
- [x] Faculty List: search by name + department + role
- [x] Faculty Profile: academic year (applies to publications, patents, workshops, seminars)
- [x] Activity Logs: action + category + date range
- [x] Backend: department, academic year, type, status, indexed, role filtering on all relevant endpoints

### 9. UI/UX Features

- [x] Responsive layout with collapsible sidebar
- [x] Mobile-first design with hamburger menu
- [x] Dark sidebar with gradient branding
- [x] Split-screen login page with animated background blurs
- [x] Toast notifications (success/error) via react-hot-toast
- [x] Loading spinners on all data fetches
- [x] Confirmation dialogs for destructive actions
- [x] Empty state messages for all lists
- [x] Role-based navigation menu
- [x] Badge system (primary, warning, success, danger)
- [x] Hover effects on table rows and buttons
- [x] Profile picture hover-reveal edit/remove buttons

### 10. Security

- [x] JWT authentication middleware on all protected routes
- [x] Role-based authorization middleware
- [x] Password hashing with bcrypt (salt rounds: 10)
- [x] Password hidden in API responses (`select: false`)
- [x] HOD department scoping in all controllers
- [x] Faculty restricted to own profile updates
- [x] File type validation (PDF, JPG, JPEG, PNG only)
- [x] File size limit (10MB configurable)
- [x] CORS enabled
- [x] Environment variables for all secrets

### 11. Cloudinary Integration

- [x] Cloud-based file storage for all uploads
- [x] Automatic file deletion on record update/delete
- [x] Profile picture with face-detection auto-crop
- [x] Base64 camera capture upload
- [x] Multer memory storage (no local temp files)
- [x] Configurable upload folder (`rdms/`, `rdms/profile-pictures/`)

---

## 📊 Database Schema Overview

| Collection | Key Fields | References |
|---|---|---|
| Users | name, employeeId, email, password, role, department, profilePicture | — |
| Education | degree, university, specialization, year | facultyId → Users |
| Certifications | title, issuedBy, date, credentialId, fileUrl | facultyId → Users |
| Publications | title, journalName, publicationType, indexedType, academicYear, fileUrl | facultyId → Users |
| Patents | title, patentNumber, status, filingDate, academicYear, fileUrl | facultyId → Users |
| Workshops | title, institution, role, date, academicYear, certificateUrl | facultyId → Users |
| Seminars | topic, institution, role, date, academicYear | facultyId → Users |
| ActivityLogs | userId, role, action, category, targetId, details, timestamp | userId → Users |

---

## 🧪 Testing Checklist

| Test | Command/Action |
|---|---|
| Seed admin | `cd backend && npm run seed` |
| Backend start | `cd backend && npm run dev` |
| Frontend start | `cd frontend && npm run dev` |
| Frontend build | `cd frontend && npm run build` |
| Login | Use <admin@rdms.com> / admin123 |
| Create HOD | Admin → Create Account → Select HOD role |
| Create Faculty | Admin → Create Account → Select Faculty role |
| Profile Picture | Faculty Profile → Hover avatar → Camera/Upload |
| Add Publication | Faculty Profile → Publications → Add →  Fill form → Submit |
| Upload Certificate | Faculty Profile → Certifications → Add → Attach file |
| Excel Export | Faculty List → Export Excel button |
| PDF Export | Faculty Profile → PDF button |
| Activity Logs | Admin → Activity Logs (verify entries) |

---

## 🔢 Version History

| Version | Date | Changes |
|---|---|---|
| 1.0.0 | Feb 2026 | Initial release: full CRUD, dashboard, exports, activity logs, profile picture with camera capture |

---

## 👨‍💻 Developer Notes

- Backend uses **separate collections** for each research type (not embedded documents) for scalability
- Cloudinary `resource_type: 'auto'` handles both images and PDFs
- Academic years are hardcoded as `['2020-21' ... '2025-26']` — extend in frontend components as needed
- HOD department scoping is enforced at the **controller level**, not middleware, for flexibility
- Activity logging is called explicitly in controllers (not via Mongoose hooks) for full control over log details
