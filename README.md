# RDMS — Research & Department Management System

> A full-stack web application for managing faculty research activities, publications, patents, workshops, seminars, certifications, and institutional rankings.

---

## 🚀 Quick Start

Double-click **`start.bat`** in the project root — it starts both servers and opens the browser automatically.

Or run manually:

```bash
# Backend
cd backend
npm install
npm run dev        # runs on http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev        # runs on http://localhost:5173
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite, Tailwind CSS, React Router v6 |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Auth** | JWT (JSON Web Tokens) + bcryptjs |
| **File Storage** | Local disk (`memory/uploads/`) via Multer |
| **PDF Export** | PDFKit |
| **Excel Export / Import** | xlsx (SheetJS) |

---

## 👥 User Roles

| Role | Capabilities |
|---|---|
| **Admin** | Full access — manage all users, view all data, export reports, send notifications, reset passwords |
| **HOD** | Manage faculty in own department, view department data, export department reports |
| **Faculty** | Manage own research entries (publications, patents, workshops, seminars, certifications, education) |

---

## 📁 Project Structure

```
Rce R and D/
├── backend/
│   ├── controllers/       # Route handlers (auth, users, publications, patents, etc.)
│   ├── middleware/        # Auth, role-check, upload
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express routes
│   ├── utils/             # Helpers (logActivity, etc.)
│   └── server.js          # Entry point
├── frontend/
│   └── src/
│       ├── api/           # Axios instance
│       ├── components/    # Reusable UI (Layout, Sidebar, Modals)
│       ├── context/       # AuthContext
│       ├── hooks/         # Custom hooks
│       ├── pages/         # Page components
│       └── App.jsx        # Routes
├── memory/uploads/        # Locally stored file uploads
├── sample_bulk_upload.csv # Sample file for bulk account creation
├── start.bat              # One-click start script
└── README.md
```

---

## ✨ Key Features

### Research Management

- **Publications** — journal/conference papers with DOI, ISSN, indexing type
- **Patents** — filing/grant tracking with status
- **Workshops & FDPs** — attendance and facilitation records
- **Seminars & Conferences** — topic, role, institution
- **Certifications** — issued-by, credential ID, verification URL
- **Education** — degree, university, specialization

### Admin Tools

- **Bulk Upload** — create multiple faculty/HOD accounts from a CSV/Excel file
- **Password Reset** — admin/HOD can reset any faculty password
- **Send Notification** — broadcast messages to all faculty, a department, or specific users
- **Export** — download faculty profiles as **PDF** (with letterhead, logo, profile photo) or **Excel**; NAAC-format reports

### Scoring & Rankings

- Configurable scoring weights per research category
- Auto-computed faculty rankings with department filter

### Dashboard & Analytics

- Personal dashboard with research totals and recent activity
- Institution-wide stats on Home page (Admin/HOD)
- Score leaderboard

---

## 📊 Bulk Upload Format

Upload `.csv` or `.xlsx` via **Create Account → Bulk Upload**.

| Column | Required | Notes |
|---|:---:|---|
| `Name` | ✅ | Full name |
| `EmployeeId` | ✅ | Unique (e.g. RCEE001) |
| `Email` | ✅ | Must end with `@rcee.ac.in` |
| `Password` | ✅ | Min 6 characters |
| `Department` | ✅ | CSE / ECE / EEE / MECH / CIVIL / AIML / AIDS / CYBER / IOT / MBA / BBA |
| `Role` | — | `faculty` (default) or `hod` |
| `MobileNumber` | — | 10-digit number |
| `Domain` | — | Research specialisation |
| `OfficialEmail` | — | |
| `JoiningDate` | — | `YYYY-MM-DD` format |
| `Address` | — | Avoid commas in address when using CSV |

> 💡 Use `sample_bulk_upload.csv` in the project root as a reference.

---

## 🔑 Default Credentials

Set up your admin account by seeding or registering manually. Faculty/HOD accounts are created by Admin/HOD via the UI.

---

## 🌐 API Base URL

```
http://localhost:5000/api
```

### Main Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Get current user |
| POST | `/auth/register` | Create single account (Admin/HOD) |
| POST | `/auth/bulk-register` | Bulk create accounts from file |
| GET | `/users` | List all faculty/HOD |
| PUT | `/users/:id/reset-password` | Reset password (Admin/HOD) |
| GET | `/publications` | List publications |
| GET | `/patents` | List patents |
| GET | `/workshops` | List workshops |
| GET | `/seminars` | List seminars |
| GET | `/certifications` | List certifications |
| GET | `/scores/rankings` | Get faculty rankings |
| GET | `/export/pdf/:id` | Download faculty PDF |
| GET | `/export/excel` | Download Excel report |
| GET | `/export/naac` | Download NAAC report |
| POST | `/notifications/send` | Broadcast notification (Admin/HOD) |

---

## 📄 Environment Variables

Create `backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
MAX_FILE_SIZE=10485760
```

---

## 📝 License

Internal use — R.C.E.E. (Ramachandra College of Engineering & Education)
