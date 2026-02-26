# RDMS – Research & Department Management System

A production-ready web application for managing faculty research profiles, publications, patents, workshops, seminars, and institutional reports with role-based access control. Built for **Ramachandra College of Engineering**.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+
- **MongoDB Atlas** account (or local MongoDB)
- **Cloudinary** account for file storage

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MAX_FILE_SIZE=10485760
```

Create `frontend/.env`:

```env
VITE_API_URL=/api
```

### 3. Seed Admin User

```bash
cd backend
npm run seed
```

Default credentials: `admin@rdms.com` / `admin123`

### 4. Run Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Frontend: `http://localhost:5173` | Backend API: `http://localhost:5000/api`

---

## ✨ Features

### Core Features

- **Faculty Research Profiles** — Comprehensive profiles with education, certifications, publications, patents, workshops, and seminars
- **Role-Based Access Control** — Admin, HOD, and Faculty roles with scoped permissions
- **Profile Picture Management** — Upload, crop, and manage faculty photos
- **File Attachments** — Upload certificates, papers, and patent documents (Cloudinary)
- **Activity Logging** — Track all CRUD operations by user

### Dashboard & Analytics

- **Dashboard Statistics** — Faculty count and research output totals
- **Department-wise Bar Chart** — Visual breakdown of research output per department
- **Year-over-Year Trend Chart** — Line chart showing research output trends across academic years
- **Top Contributors Table** — Leaderboard of top 5 faculty by total research output
- **NAAC Report Export** — One-click Excel export formatted to NAAC criteria (3.4.3, 3.4.4, 3.4.5)
- **Excel Report Export** — Download all research data as formatted Excel workbook

### Search & Navigation

- **Global Search** — Debounced autocomplete search across all modules (publications, patents, workshops, seminars, faculty)
- **Explore Page** — Admin/HOD tabbed data explorer with filtering across all research categories

### Faculty Comparison

- **Side-by-Side Comparison** — Select any two faculty members and compare research output
- **Radar Chart Visualization** — Visual radar chart comparing output across 5 categories
- **Detailed Stat Blocks** — Category-by-category comparison with win/loss highlighting

### Notifications

- **Real-Time Notification Bell** — Unread count badge with dropdown panel
- **Auto-Polling** — Notifications refresh every 30 seconds
- **Mark As Read** — Individual and bulk mark-as-read support
- **Triggered Notifications** — Automatic notifications when admin/HOD adds entries for faculty

### Profile & Security

- **Change Password** — Secure password change with current password verification
- **Print-Friendly Profile** — Browser-native print with clean CSS (hides sidebar/buttons)
- **PDF Profile Export** — Download any faculty profile as formatted PDF
- **Edit Profile** — Faculty can update their own contact info and domain

### UI/UX Design

- **College Branding** — Deep Royal Blue (#1E3A8A) and Orange (#F97316) color scheme
- **Top Header Bar** — College logo and name displayed at the top of every page
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Collapsible Sidebar** — Toggle sidebar width with smooth animations

---

## 👥 Roles & Permissions

| Feature | Admin | HOD | Faculty |
|---|:---:|:---:|:---:|
| Dashboard & Analytics | ✅ All depts | ✅ Own dept | ❌ |
| Faculty List | ✅ All | ✅ Own dept | ❌ |
| Faculty Comparison | ✅ | ✅ | ❌ |
| Create Accounts | ✅ | ✅ | ❌ |
| View Any Profile | ✅ | ✅ Own dept | ❌ |
| Edit Own Profile | ✅ | ✅ | ✅ |
| Add/Edit Research Entries | ✅ Any | ✅ Own dept | ✅ Own |
| Excel / NAAC Export | ✅ | ✅ | ❌ |
| PDF Export | ✅ | ✅ | ✅ Own |
| Global Search | ✅ | ✅ | ✅ |
| Notifications | ✅ | ✅ | ✅ |
| Change Password | ✅ | ✅ | ✅ |
| Activity Logs | ✅ | ❌ | ❌ |
| Delete Users | ✅ | ❌ | ❌ |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS 3, Recharts, Lucide Icons |
| Backend | Node.js, Express 4, Mongoose 8 |
| Database | MongoDB Atlas |
| Auth | JWT (jsonwebtoken), bcryptjs |
| File Storage | Cloudinary (via Multer) |
| Exports | ExcelJS (xlsx), PDFKit (pdf) |

---

## 📁 Project Structure

```
rdms/
├── backend/
│   ├── config/          # DB & Cloudinary config
│   ├── controllers/     # 14 controllers (auth, user, CRUD ×6, dashboard, export, logs, search, notification)
│   ├── middleware/       # auth, roleCheck, upload, errorHandler
│   ├── models/          # 9 Mongoose models (User, Publication, Patent, Workshop, Seminar, Education, Certification, ActivityLog, Notification)
│   ├── routes/          # 13 route files
│   ├── utils/           # logActivity helper
│   ├── server.js        # Express entry point
│   └── seed.js          # Admin seeder
├── frontend/
│   ├── src/
│   │   ├── api/         # Axios instance with JWT interceptor
│   │   ├── assets/      # College logo (rcee.png)
│   │   ├── context/     # AuthContext (login, logout, token mgmt)
│   │   ├── components/
│   │   │   ├── layout/  # Layout, Sidebar
│   │   │   ├── ui/      # Accordion, Modal, ProfilePicture, GlobalSearch, NotificationBell, ChangePasswordModal
│   │   │   └── dashboard/ # StatCard, DepartmentChart
│   │   ├── pages/       # 10 pages (Login, Home, Dashboard, FacultyList, FacultyProfile, MyProfile, CreateAccount, ActivityLogs, Explore, FacultyComparison)
│   │   └── App.jsx      # Router with ProtectedRoute
│   └── index.html
└── README.md
```

---

## 🔑 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Admin | Create new user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | All | Get current user |
| PUT | `/api/auth/change-password` | All | Change password |
| GET | `/api/users` | Admin/HOD | List users (supports `role=faculty,hod`) |
| GET | `/api/users/:id` | All | Get user profile |
| PUT | `/api/users/:id` | Self/Admin | Update user |
| PUT | `/api/users/:id/profile-picture` | Self/Admin | Upload profile picture |
| DELETE | `/api/users/:id/profile-picture` | Self/Admin | Remove profile picture |
| DELETE | `/api/users/:id` | Admin | Delete user |
| CRUD | `/api/education/:facultyId` | All | Education records |
| CRUD | `/api/certifications/:facultyId` | All | Certifications (+ file upload) |
| CRUD | `/api/publications/faculty/:facultyId` | All | Publications (+ file upload) |
| CRUD | `/api/patents/faculty/:facultyId` | All | Patents (+ file upload) |
| CRUD | `/api/workshops/faculty/:facultyId` | All | Workshops (+ file upload) |
| CRUD | `/api/seminars/faculty/:facultyId` | All | Seminars |
| GET | `/api/dashboard/stats` | Admin/HOD | Dashboard statistics |
| GET | `/api/dashboard/chart` | Admin/HOD | Department chart data |
| GET | `/api/dashboard/trends` | Admin/HOD | Year-over-year trends |
| GET | `/api/dashboard/top-contributors` | Admin/HOD | Top 5 contributors |
| GET | `/api/dashboard/compare` | Admin/HOD | Faculty comparison (`?faculty1=&faculty2=`) |
| GET | `/api/search?q=query` | All | Global search across all modules |
| GET | `/api/notifications` | All | Get user notifications |
| PUT | `/api/notifications/:id/read` | All | Mark notification as read |
| PUT | `/api/notifications/read-all` | All | Mark all notifications as read |
| GET | `/api/export/excel` | Admin/HOD | Excel report download |
| GET | `/api/export/naac` | Admin/HOD | NAAC report download |
| GET | `/api/export/pdf/:facultyId` | All | PDF profile download |
| GET | `/api/activity-logs` | Admin | Activity logs |

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| Primary (Deep Blue) | `#1E3A8A` | Headers, buttons, sidebar, charts |
| Accent (Orange) | `#F97316` | Highlights, badges, active indicators, CTA |
| Backgrounds | `#f8fafc` (body), `#fff` (cards) | Clean, institutional feel |
| Typography | System fonts | Headers in blue, body in dark gray |
| Borders | No gradients | Solid colors, subtle shadows |

---

## 🔧 Build for Production

```bash
cd frontend
npm run build
```

Output: `frontend/dist/` — serve with any static file server or integrate with Express.

---

## 📄 License

ISC
