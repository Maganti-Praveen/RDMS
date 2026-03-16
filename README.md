# RCEE RIMS — Research Information Management System

> **Ramachandra College of Engineering** — RCEE Research Information Management System  
> A full-stack MERN web application for digitally managing faculty research profiles, publications, patents, workshops, seminars, certifications, and institutional reports.

🔗 **GitHub:** https://github.com/Maganti-Praveen/RDMS

---

## ⚡ Quick Start

### Option 1 — One Click (Windows)
Double-click **`start.bat`** in the project root — starts both servers and opens the browser automatically.

### Option 2 — Manual

```bash
# Clone the repo
git clone https://github.com/Maganti-Praveen/RDMS.git
cd RDMS
```

**Terminal 1 — Backend**
```bash
cd backend
npm install
node seed.js        # Creates admin account (run once)
npm run dev         # Starts API server → http://localhost:5000
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm install
npm run dev         # Starts React app → http://localhost:5173
```

---

## 🔑 Default Admin Login

```
Email:    admin@rcee.ac.in
Password: admin123
```
> Change the password after first login.

---

## ⚙️ Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
MAX_FILE_SIZE=10485760

EMAIL_USER=rcee.rims@gmail.com
EMAIL_PASS=your_gmail_app_password
VITE_FRONTEND_PORT=5173
```

Create `frontend/.env`:

```env
VITE_API_URL=/api
VITE_PORT=5173
```

> **Gmail App Password:** Go to Google Account → Security → 2-Step Verification (must be ON) → App Passwords → Create one for RIMS.

---

## 🌐 Network Access (LAN / College Wi-Fi)

The app is accessible from **any device on the same Wi-Fi** (mobile, other laptops):

1. Find the server laptop's IP: run `ipconfig` → look for IPv4 (e.g. `192.168.1.51`)
2. Open on any device: `http://192.168.1.51:5173`

The backend auto-detects the server IP for reset-password email links — no manual configuration needed.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Recharts |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Authentication** | JWT + bcryptjs |
| **Email** | Nodemailer + Gmail SMTP (App Password) |
| **File Storage** | Local disk via Multer (dept + year organized) |
| **PDF Export** | PDFKit |
| **Excel Export/Import** | SheetJS (xlsx) |

---

## 👥 User Roles

| Role | Access |
|---|---|
| **Admin** | Full access — manage all users, view all data, dept comparison, export, broadcast emails/notifications, reset passwords |
| **HOD** | Manage faculty in own department only, export dept reports, send notifications to own dept |
| **Faculty** | Manage own research entries and profile only |

---

## 📁 Project Structure

```
RDMS/
├── backend/
│   ├── config/            # DB connection
│   ├── controllers/       # Route handlers
│   ├── middleware/        # Auth, role-check, upload
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express routes
│   ├── utils/             # mailer, logActivity, autoSeedAcademicYears
│   ├── logo/              # rcee.png (used in PDF + emails)
│   ├── seed.js            # Seed admin account
│   └── server.js          # Entry point
├── frontend/
│   └── src/
│       ├── api/           # Axios instance
│       ├── components/    # Reusable UI components
│       ├── context/       # AuthContext
│       ├── pages/         # All page components
│       └── App.jsx        # Routes
├── memory/                # Uploaded files (gitignored)
│   ├── publications/2026/cse/
│   ├── patents/2026/ece/
│   ├── profile-pictures/2026/mech/
│   └── ...
├── sample_bulk_upload.csv
├── start.bat
└── README.md
```

---

## ✨ Key Features

### 📚 Research Management
- **Publications** — journals, conferences, books with DOI, ISSN, indexing type
- **Patents** — filing/grant tracking, status (Filed/Published/Granted)
- **Workshops & FDPs** — attendance/facilitation records with certificate upload
- **Seminars** — topic, role, institution
- **Certifications** — title, issuer, credential ID, file upload
- **Education** — degree, university, specialization

### 👨‍💼 Admin Tools
- **Bulk Upload** — create multiple accounts from CSV/Excel
- **Password Reset** — Admin/HOD can reset faculty passwords
- **Send Notification** — in-app + optional email broadcast to all/department faculty
- **Department Comparison** — side-by-side radar & bar chart comparison (Admin only)
- **Export** — Faculty PDF (with logo + photo), Excel workbook, NAAC report

### 📧 Email Service
- **Welcome Email** — sent automatically when a new account is created
- **Forgot Password** — secure token-based reset link (expires in 15 min)
- **Broadcast Email** — admin can toggle email alongside in-app notifications
- All emails include the RCEE logo as inline header

### 📊 Rankings
- Count-based ranking (total uploads across all research categories)
- College top 5 + Department top 3 displayed on leaderboard

### 🗓️ Academic Year Auto-Management
- Academic years auto-created on server startup (no manual seeding)
- Current + next year always available; history from 2020–21

---

## 🗂️ File Storage Structure

Uploaded files are organized by **category → year → department**:

```
memory/
├── publications/
│   └── 2026/
│       ├── cse/ → RCEE001_1234567890_abc12_paper.pdf
│       └── ece/
├── patents/2026/cse/
├── workshops/2026/ece/
├── certifications/2026/mech/
└── profile-pictures/2026/cse/
```

---

## 📊 Bulk Upload Format

Upload `.csv` or `.xlsx` via **Create Account → Bulk Upload**  
Reference file: `sample_bulk_upload.csv`

| Column | Required | Notes |
|---|:---:|---|
| `Name` | ✅ | Full name |
| `EmployeeId` | ✅ | Unique (e.g. RCEE001) |
| `Email` | ✅ | Official email |
| `Password` | ✅ | Min 6 characters |
| `Department` | ✅ | CSE / ECE / EEE / MECH / CIVIL / AIML / AIDS / CYBER / IOT / MBA / BBA |
| `Role` | — | `faculty` (default) or `hod` |
| `MobileNumber` | — | 10-digit number |
| `Domain` | — | Research specialisation |
| `PersonalEmail` | — | Gmail or personal email |
| `JoiningDate` | — | `YYYY-MM-DD` format |
| `Address` | — | Avoid commas in CSV |

---

## 🌐 API Endpoints

Base URL: `http://localhost:5000/api`

| Method | Route | Description |
|---|---|---|
| POST | `/auth/login` | Login |
| POST | `/auth/forgot-password` | Send password reset email |
| PUT | `/auth/reset-password` | Reset password with token |
| POST | `/auth/register` | Create account (Admin/HOD) |
| POST | `/auth/bulk-register` | Bulk create from file |
| GET | `/users` | List all faculty/HOD |
| GET | `/publications` | List publications |
| GET | `/patents` | List patents |
| GET | `/workshops` | List workshops |
| GET | `/seminars` | List seminars |
| GET | `/certifications` | List certifications |
| GET | `/scores/rankings` | Faculty rankings (count-based) |
| GET | `/dashboard/compare-dept` | Dept comparison (Admin) |
| GET | `/export/pdf/:id` | Download faculty PDF |
| GET | `/export/excel` | Download Excel report |
| GET | `/export/naac` | Download NAAC report |
| POST | `/notifications/send` | Broadcast (in-app + email) |

---

## 📝 License

Internal use — Ramachandra College of Engineering, Eluru.
