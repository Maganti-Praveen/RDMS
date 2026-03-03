# RDMS – Project Info & Features Documentation

> **Research & Department Management System**  
> Version 1.1.0 | Built with MERN Stack

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
                                     Multer + Local Disk
                                            │
                                     ┌──────▼───────┐
                                     │  memory/      │
                                     │  uploads/     │
                                     │  (Local FS)   │
                                     └──────────────┘
```

- **Frontend**: React 18 with Vite, Tailwind CSS for styling
- **Backend**: Express.js REST API with JWT authentication
- **Database**: MongoDB Atlas with Mongoose ODM (8+ collections)
- **File Storage**: Local disk (`memory/uploads/`) via Multer memory storage
- **Exports**: xlsx (SheetJS) for spreadsheets, PDFKit for PDF generation

---

## ✅ Features Implemented

### 1. Authentication & Authorization

- [x] JWT-based login with bcrypt password hashing
- [x] Token stored in localStorage, auto-attached via Axios interceptor
- [x] Auto-logout on 401 (expired/invalid token)
- [x] Role-based route protection (Admin, HOD, Faculty)
- [x] Password field hidden with `select: false` in schema
- [x] Admin/HOD-only user registration

### 2. User Management

- [x] Admin/HOD can create Faculty and HOD accounts (single form)
- [x] **Bulk Upload** — create multiple accounts from CSV/Excel (`.csv`, `.xlsx`, `.xls`)
  - Handles Excel serial date numbers automatically (`cellDates: true` + `parseDate()` helper)
  - Skips duplicates gracefully, reports errors per row
  - `sample_bulk_upload.csv` provided in project root
- [x] **Password Reset** — Admin/HOD can reset any faculty password via modal
- [x] Full user fields: name, employeeId, email, role, department, mobileNumber, domain, officialEmail, joiningDate, address
- [x] Profile picture upload (file or live camera capture), stored locally
- [x] Admin/HOD can delete users; bulk delete with checkboxes
- [x] Faculty can update their own profile
- [x] HOD restricted to viewing/managing own department
- [x] Departments: CSE, ECE, EEE, MECH, CIVIL, AIML, AIDS, CYBER, IOT, MBA, BBA

### 3. Dashboard & Analytics

- [x] 6 statistics cards: Faculty, Publications, Patents, Workshops, Seminars, Certifications (real totals)
- [x] Department-wise research output bar chart (Recharts)
- [x] Filter by academic year (2020-21 through 2025-26)
- [x] Admin can filter by department; HOD auto-scoped to their department
- [x] Real-time data from aggregated database queries

### 4. Faculty Profile Page

- [x] Profile header with avatar/photo, name, department, employee ID, role badge
- [x] Profile picture upload (file or camera), stored in `memory/uploads/`
- [x] 7 accordion sections: Basic Info, Education, Certifications, Publications, Patents, Workshops, Seminars
- [x] Tabular display with CRUD modals (Add / Edit / Delete) for all research entries
- [x] File upload for certifications, publications, patents, workshops (served via `/uploads/`)
- [x] External link to uploaded files (opens in new tab)
- [x] Academic year filter across all sections
- [x] PDF download of complete faculty profile
- [x] Role-based edit permissions (self, admin, hod)

### 5. Data Collections (6 Research Types)

#### Education
- Fields: degree, university, specialization, year

#### Certifications
- Fields: title, issuedBy, date, credentialId, fileUrl (local)

#### Publications
- Fields: title, journalName, issn, volume, doi, publicationType, indexedType, academicYear, publicationDate, fileUrl
- Types: Journal, Conference, Book, Chapter
- Indexed: SCI, Scopus, SEI, UGC, Other

#### Patents
- Fields: title, patentNumber, status, filingDate, grantDate, academicYear, fileUrl
- Status: Filed, Published, Granted, Utility

#### Workshops
- Fields: title, institution, role, date, academicYear, certificateUrl
- Role: Organized, Attended

#### Seminars
- Fields: topic, institution, role, date, academicYear

### 6. Export Features

- [x] **Excel Export** — Multi-sheet workbook via SheetJS
  - Summary, Publications, Patents sheets
  - Filterable by department; Admin/HOD access only
- [x] **PDF Export** — Individual faculty profile via PDFKit
  - College letterhead with RCEE logo (wider horizontal fit)
  - Profile photo (loaded from local `memory/uploads/`, fallback to initial-letter circle)
  - Name block with department, role, employee ID and email
  - Stats strip (count of each research category)
  - All 6 research sections in formatted tables (alternating row colours)
  - Dedicated full-width address row (wraps for long addresses)
  - Page numbers in footer; auto page-break
- [x] **NAAC Report Export** — Department-wise formatted Excel

### 7. Notification System

- [x] **Send Notifications** — Admin/HOD can broadcast messages from the Explore page
  - Target options: All users, specific department, or individual users
  - HOD can only send within own department
  - Category: `General` (stored in Notification model)
- [x] In-app notification bell with unread count
- [x] Mark as read / mark all as read
- [x] Notification categories: Publication, Patent, Workshop, Seminar, Certification, User, General

### 8. Activity Logging

- [x] All Add, Update, Delete operations automatically logged
- [x] Logs: userId, role, action, category, targetId, details, timestamp
- [x] Admin-only Activity Logs page with filtering (action, category, date range)
- [x] Pagination (20 per page)

### 9. Scoring & Rankings

- [x] Configurable scoring weights per research category
- [x] Auto-computed faculty score ranking (optimised with `Promise.all`, no N+1 queries)
- [x] Department and academic year filter on leaderboard

### 10. UI/UX Features

- [x] Responsive layout with collapsible sidebar
- [x] Mobile-first design with hamburger menu
- [x] Dark sidebar with gradient branding
- [x] Split-screen login page
- [x] Toast notifications via `react-hot-toast`
- [x] Loading spinners on all data fetches
- [x] Confirmation dialogs for destructive actions
- [x] Empty state messages for all lists
- [x] Role-based navigation menu

### 11. Security

- [x] JWT authentication middleware on all protected routes
- [x] Role-based authorization middleware (`authorize()`)
- [x] Password hashing with bcrypt (salt rounds: 10)
- [x] Password hidden in API responses (`select: false`)
- [x] HOD department scoping in all controllers
- [x] Faculty restricted to own profile updates
- [x] File type validation (PDF, JPG, JPEG, PNG only)
- [x] File size limit (10 MB, configurable via `MAX_FILE_SIZE` env var)
- [x] CORS enabled
- [x] Environment variables for all secrets

### 12. Local File Storage

- [x] Multer memory storage — files buffered in memory, written to disk in controller
- [x] Storage path: `<root>/memory/uploads/<category>/` (e.g. `memory/uploads/publications/`)
- [x] Files served statically via `/uploads/` Express route
- [x] Unique filenames: `timestamp_random_originalname`
- [x] Old file deleted automatically on record update or delete
- [x] PDF export reads profile pictures directly from disk path (no HTTP call)

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
| Notifications | userId, message, type, category, link, read | userId → Users |
| ScoreConfig | category, weight, description | — |

---

## 🚀 Quick Start

Double-click **`start.bat`** in project root — starts both servers and opens browser.

Or manually:

```bash
# Terminal 1 — Backend
cd backend && npm install && npm run dev    # → http://localhost:5000

# Terminal 2 — Frontend
cd frontend && npm install && npm run dev  # → http://localhost:5173
```

---

## ⚙️ Environment Variables

`backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
MAX_FILE_SIZE=10485760
```

---

## 📊 Bulk Upload CSV Format

File: `sample_bulk_upload.csv` (project root)

| Column | Required | Notes |
|---|:---:|---|
| Name | ✅ | Full name |
| EmployeeId | ✅ | Unique (e.g. RCEE001) |
| Email | ✅ | Must end with `@rcee.ac.in` |
| Password | ✅ | Min 6 characters |
| Department | ✅ | e.g. CSE, ECE, AIML |
| Role | — | `faculty` (default) or `hod` |
| MobileNumber | — | 10 digits |
| Domain | — | Research specialisation |
| OfficialEmail | — | Alternate college email |
| JoiningDate | — | `YYYY-MM-DD` (ISO format) |
| Address | — | Avoid commas in CSV mode |

> **Note:** If opening the CSV in Excel before uploading, Excel may convert dates to serial numbers. The backend handles this automatically.

---

## 🔢 Version History

| Version | Date | Changes |
|---|---|---|
| 1.0.0 | Feb 2026 | Initial release: full CRUD, dashboard, exports, activity logs, profile picture with camera capture |
| 1.1.0 | Mar 2026 | Password reset (Admin/HOD), broadcast notifications from Explore page, professional PDF redesign (logo, profile photo, address fix, no emoji), bulk upload Excel serial date fix, `start.bat` one-click launcher, `My Profile` route fix for admin, rankings N+1 query fix |

---

## 👨‍💻 Developer Notes

- Backend uses **separate collections** for each research type (not embedded) for scalability
- File storage is **local disk** (`memory/uploads/`) — served via Express static middleware
- `memory/` folder should be **gitignored** (contains uploaded files, not source code)
- Academic years are hardcoded as `['2020-21' ... '2025-26']` — extend in frontend components as needed
- HOD department scoping is enforced at the **controller level** for flexibility
- Activity logging is called explicitly in controllers (not Mongoose hooks) for full control
- PDF export uses **absolute x/y positioning** for all text — prevents layout drift across PDFKit versions
