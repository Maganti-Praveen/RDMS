# RCEE RIMS — Project Explanation (Viva Voce Guide)

> **RCEE Research Information Management System**  
> Ramachandra College of Engineering, Eluru  
> Full-Stack MERN Web Application

---

## 📌 What is RCEE RIMS?

RCEE RIMS (Research Information Management System) is a **web-based platform** developed for Ramachandra College of Engineering to **digitally track and manage faculty research activities**. Instead of maintaining research data in spreadsheets or paper registers, faculty can log into the system and record their publications, patents, workshops, seminars, certifications, and educational qualifications — all in one place.

Administrators (Admin and HOD) can view, compare, and export this data to generate institutional reports for **NAAC accreditation** and internal academic reviews.

---

## 🏗️ System Architecture

The project follows the **MERN Stack** architecture:

```
Browser (React) ──HTTP──► Express (Node.js) ──Mongoose──► MongoDB Atlas
                               │
                        ┌──────┴──────┐
                       Multer        Nodemailer
                     (File Upload)  (Email Service)
```

| Component | Technology | Role |
|---|---|---|
| **Frontend** | React 18 + Vite + Tailwind CSS | User interface |
| **Backend** | Node.js + Express.js | REST API server |
| **Database** | MongoDB Atlas + Mongoose | Data storage |
| **Auth** | JWT + bcryptjs | Login & security |
| **Email** | Nodemailer + Gmail SMTP | Welcome & reset emails |
| **File Upload** | Multer | Handle up to 10MB files |
| **PDF Export** | PDFKit | Generate faculty profile PDFs |
| **Excel** | SheetJS (xlsx) | Import/export spreadsheets |
| **Charts** | Recharts | Dashboard bar/radar charts |

---

## 🔄 How the Application Works (Flow)

### 1. Login Flow
1. User enters email + password on the login page
2. Frontend sends `POST /api/auth/login` to backend
3. Backend finds user in MongoDB, verifies password using **bcrypt**
4. If valid → generates a **JWT token** (7-day expiry) and sends it back
5. Frontend stores the token in **localStorage** and attaches it to every API request via an **Axios interceptor**
6. On 401 (expired token) → auto logout

### 2. Data Entry Flow (Faculty)
1. Faculty logs in → lands on their **Home page** (personal dashboard)
2. Clicks "My Profile" → sees all research sections as collapsible accordions
3. Clicks "Add" on any section → modal form opens
4. Fills form, optionally uploads a PDF/image file
5. Frontend sends `POST /api/publications` (or patents, workshops, etc.) with `multipart/form-data`
6. Backend middleware (Multer) receives the file into memory buffer
7. File is saved to disk: `memory/publications/2026/cse/EMPID_timestamp_file.pdf`
8. Record is created in MongoDB with the file URL
9. Activity is logged in the `ActivityLogs` collection

### 3. Email Flow
1. **Welcome Email**: When Admin creates a new account → `sendWelcomeEmail()` fires automatically (fire-and-forget, doesn't block the response)
2. **Forgot Password**: User requests reset → backend generates a random token → hashes it with SHA-256 → stores hash in DB → sends **raw token** in email link → user clicks link → frontend reads token from URL → sends to `/api/auth/reset-password` → backend hashes incoming token and matches with DB → updates password
3. **Broadcast Email**: Admin/HOD sends notification with "Also send via Email" toggle → backend fetches recipient emails and sends via BCC

### 4. File Storage Flow
```
Upload → Multer buffers → saveToMemory() → creates:
  memory/{category}/{year}/{department}/{empId}_{timestamp}_{random}_{name}.ext
```
The file is then served via Express static:  
`GET /uploads/publications/2026/cse/RCEE001_123_abc_paper.pdf`

### 5. PDF Export Flow
1. Admin/HOD/Faculty clicks "Download PDF" on a faculty profile
2. Frontend calls `GET /api/export/pdf/:userId`
3. Backend:
   - Fetches user + all 6 research collections from MongoDB in parallel (`Promise.all`)
   - Reads RCEE logo from disk (`logo/rcee.png`)
   - Reads profile picture from local disk path (if exists)
   - Builds PDF using **PDFKit** with letterhead, photo, research tables
   - Streams PDF back as `application/pdf` response
4. Browser downloads as `EMPID_Name_profile.pdf`

---

## 🗄️ Database Design

The database has **10 MongoDB collections**, connected by `facultyId` references:

```
Users (central)
  ├── Education       (facultyId → Users)
  ├── Certifications  (facultyId → Users)
  ├── Publications    (facultyId → Users)
  ├── Patents         (facultyId → Users)
  ├── Workshops       (facultyId → Users)
  ├── Seminars        (facultyId → Users)
  ├── ActivityLogs    (userId → Users)
  ├── Notifications   (userId → Users)
  └── AcademicYears   (standalone — labels like "2025-26")
```

**Why separate collections (not embedded)?**  
→ Scalability: A faculty may have 100+ publications. Embedding inside User document would make the document huge. Separate collections allow efficient querying, pagination, and indexing.

---

## 🔐 Security Implementation

| Security Layer | Implementation |
|---|---|
| **Password Hashing** | bcryptjs with 10 salt rounds — even if DB is leaked, passwords are safe |
| **JWT Auth** | Every protected route verified by `protect` middleware |
| **Role Authorization** | `authorize('admin','hod')` middleware checks user role |
| **Ownership Check** | Faculty can only modify their own records (checked in controller) |
| **Reset Token Security** | Random 32-byte token → SHA-256 hashed → only hash stored in DB → raw token sent via email → expires in 15 min |
| **File Validation** | Only PDF, JPG, JPEG, PNG allowed; max 10 MB |
| **HOD Scoping** | HOD's department auto-injected in every query |

---

## 📈 Rankings System

Rankings are **count-based** (not score-based):
- Count total uploads across all 6 categories per faculty
- Sort descending → top 5 college-wide, top 3 per department
- Computed efficiently using `Promise.all` — all 6 category queries run in **parallel**
- Previously the system used configurable point weights (e.g. SCI paper = 10 pts) — this was simplified to total counts for fairness

---

## 🗓️ Academic Year Management

Instead of hardcoding academic years:
- `autoSeedAcademicYears.js` runs on **every server startup**
- Indian academic year convention (June–May): if current month ≥ June → new year started
- First run (empty DB): creates all years from 2020-21 → next year
- Subsequent runs: only adds current + next year if not already present
- **Zero manual intervention** needed when a new year starts

---

## 🌐 LAN Access

The backend binds to `0.0.0.0` (all network interfaces), so it's accessible from any device on the same Wi-Fi:
- CORS configured as `origin: '*'` for LAN
- Frontend API calls use **relative URL** (`/api`) with Vite proxy → avoids hardcoded IP
- Email reset links auto-detect server IP using `os.networkInterfaces()` → works on any network

---

## 📧 Email Service Details

- **Provider**: Gmail via Nodemailer (SMTP port 465, SSL)
- **Auth**: Gmail App Password (requires 2-Step Verification)
- **Logo**: RCEE logo embedded as **CID inline attachment** (`cid:rceelogo`) — not `data:` URI which Gmail blocks
- **Welcome email**: fires after account creation response is sent (fire-and-forget so user doesn't wait)
- **Broadcast**: sent via **BCC** — keeps faculty emails private from each other

---

## 🗂️ File Organization

```
memory/
└── {category}/         ← publications, patents, workshops, certifications, profile-pictures
    └── {year}/         ← 2025, 2026, 2027... (auto from upload date)
        └── {dept}/     ← cse, ece, mech... (from logged-in user's department)
            └── {EMPID}_{timestamp}_{random}_{originalname}.ext
```

Benefits:
- Easy to find files by department/year
- Natural archival structure
- New year/dept folders created automatically

---

## 🖥️ Frontend Architecture

```
src/
├── api/
│   └── axios.js          ← Axios instance with JWT interceptor + auto-logout
├── context/
│   └── AuthContext.jsx   ← Global auth state (user, login, logout)
├── components/
│   ├── layout/           ← Sidebar, Header, Layout wrapper
│   └── ui/               ← Reusable: NotificationBell, SendNotificationModal, etc.
└── pages/
    ├── Login.jsx          ← Split-screen login
    ├── ForgotPassword.jsx ← Email input → sends reset link
    ├── ResetPassword.jsx  ← Token from URL → new password
    ├── Dashboard.jsx      ← Admin/HOD stats + charts
    ├── Home.jsx           ← Faculty personal dashboard
    ├── FacultyProfile.jsx ← Full profile with all research sections
    ├── Explore.jsx        ← Search + browse all faculty
    ├── DeptComparison.jsx ← Side-by-side dept stats (Admin)
    └── ...
```

**React Router v6** handles all routing with a `ProtectedRoute` wrapper that redirects unauthenticated users to login.

---

## 💬 Common Viva Questions & Answers

**Q: Why MERN Stack?**  
A: MongoDB is schema-flexible for varied research data, Node.js is non-blocking for handling file uploads, React gives fast UI with component reuse, all in one language (JavaScript/JSON).

**Q: Why local file storage instead of cloud (like Cloudinary)?**  
A: For institutional use within college network, local storage is faster, free, and avoids network dependency. Files are organized by category/year/department for easy retrieval.

**Q: How does JWT work here?**  
A: On login, server creates a signed token with userId. Client stores it in localStorage and sends it in every API request header (`Authorization: Bearer token`). Server verifies signature on every protected route.

**Q: How is the forgot password secure?**  
A: A random 32-byte token is generated. Only its SHA-256 hash is stored in DB. The raw token is sent in the email link. When user clicks, the raw token is hashed again and compared with DB — if DB is leaked, attacker can't use the hash as a reset link.

**Q: How are rankings calculated?**  
A: We count total uploads (publications + patents + workshops + seminars + certifications + education) per faculty. All 6 database queries run in parallel using `Promise.all` for efficiency. Results are sorted descending by total count.

**Q: What happens when a new academic year starts?**  
A: On every server restart, `autoSeedAcademicYears.js` runs. It checks if the current and next academic year labels exist in DB — if not, creates them. So 2026-27 appears automatically in June 2026.

**Q: How does the email logo work in Gmail?**  
A: Gmail blocks `data:` URI images. We use **CID (Content-ID)** — the image file is attached inline with a unique ID, and the HTML references it as `src="cid:rceelogo"`. All major email clients support this.

**Q: How is the department comparison implemented?**  
A: Backend aggregates total counts and per-faculty averages for each research category for two departments in parallel. Frontend displays this using Recharts RadarChart (polygon) and BarChart for visual comparison.

---

## 📦 NPM Packages Used

### Backend
| Package | Purpose |
|---|---|
| `express` | HTTP server & routing |
| `mongoose` | MongoDB ODM |
| `jsonwebtoken` | JWT creation & verification |
| `bcryptjs` | Password hashing |
| `multer` | File upload handling |
| `nodemailer` | Email sending via SMTP |
| `pdfkit` | PDF generation |
| `xlsx` | Excel read/write |
| `dotenv` | Environment variable loading |
| `cors` | Cross-origin requests |
| `nodemon` | Dev server auto-restart |

### Frontend
| Package | Purpose |
|---|---|
| `react` + `react-dom` | UI library |
| `vite` | Fast build tool & dev server |
| `react-router-dom` | Client-side routing |
| `axios` | HTTP client with interceptors |
| `recharts` | Charts (bar, radar) |
| `react-hot-toast` | Toast notifications |
| `lucide-react` | Icon library |
| `tailwindcss` | Utility-first CSS |
