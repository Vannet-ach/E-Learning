import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./pages/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminLessons from "./pages/admin/AdminLessons";
import AdminQuiz from "./pages/admin/AdminQuiz";

// User pages
import UserDashboard from "./pages/user/UserDashboard";
import UserProgress from "./pages/user/UserProgress";
import CoursesPage from "./pages/user/CoursesPage";
import LessonPage from "./pages/user/LessonPage";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ── Admin routes ── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="lessons" element={<AdminLessons />} />
            <Route path="quiz/:lessonId" element={<AdminQuiz />} />
          </Route>

          {/* ── User routes ── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<UserDashboard />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="courses/:courseId/lessons" element={<LessonPage />} />
            <Route path="courses/:courseId/lessons/:lessonId" element={<LessonPage />} />
            <Route path="progress" element={<UserProgress />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
      </ThemeProvider>
  );
}
