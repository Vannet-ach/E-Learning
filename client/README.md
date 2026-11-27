# LearnHub — E-Learning Frontend

React + Vite + TypeScript + Tailwind CSS

---

## 🚀 របៀបដំណើរការ (Setup)

### 1. ដំឡើង dependencies
```bash
cd elearning-frontend
npm install
```

### 2. ប្រាកដថា Backend កំពុងដំណើរការ
```bash
# នៅក្នុង folder backend
node dist/index.js
# ឬ
npx ts-node src/index.ts
```
Backend ត្រូវដំណើរការនៅ: `http://localhost:3000`

### 3. ចាប់ផ្ដើម Frontend
```bash
npm run dev
```
Frontend នឹងដំណើរការនៅ: `http://localhost:5173`

---

## 📁 Structure

```
src/
├── types/          → TypeScript types (User, Course, Lesson...)
├── services/
│   └── api.ts      → Axios — ភ្ជាប់ទៅ /users /courses /lessons...
├── context/
│   └── AuthContext.tsx → JWT auth + user session
├── components/
│   ├── Sidebar.tsx      → Navigation sidebar
│   └── ProtectedRoute.tsx → Route guard
├── pages/
│   ├── LoginPage.tsx    → POST /users/login
│   ├── DashboardLayout.tsx
│   ├── admin/
│   │   ├── AdminDashboard.tsx  → Overview + stats
│   │   ├── AdminCourses.tsx    → CRUD courses
│   │   ├── AdminStudents.tsx   → View/delete students
│   │   └── AdminLessons.tsx    → CRUD lessons
│   └── user/
│       ├── UserDashboard.tsx   → Enrollments + browse
│       └── UserProgress.tsx    → Lesson progress
├── App.tsx         → Router
└── main.tsx        → Entry point
```

---

## 🔗 API Endpoints ដែលប្រើ

| Action | Method | Endpoint |
|--------|--------|----------|
| Login | POST | `/users/login` |
| Get all users | GET | `/users` |
| Get all courses | GET | `/courses` |
| Create course | POST | `/courses` |
| Delete course | DELETE | `/courses/:id` |
| Get all lessons | GET | `/lessons` |
| Create lesson | POST | `/lessons` |
| Get enrollments by user | GET | `/enrollments/user/:id` |
| Enroll | POST | `/enrollments` |
| Get progress by user | GET | `/progress/user/:id` |

---

## 🔐 Roles

- **ADMIN** → redirect to `/admin`
- **USER** → redirect to `/dashboard`
