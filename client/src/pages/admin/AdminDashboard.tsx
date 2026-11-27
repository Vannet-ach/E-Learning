import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usersApi, coursesApi, enrollmentsApi } from "../../services/api";
import type { User, Course, Enrollment } from "../../types";
import { card, tableCell } from "../../styles";

export default function AdminDashboard() {
  const [users, setUsers]             = useState<User[]>([]);
  const [courses, setCourses]         = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.all([usersApi.getAll(), coursesApi.getAll(), enrollmentsApi.getAll()])
      .then(([u, c, e]) => { setUsers(u.data); setCourses(c.data); setEnrollments(e.data); })
      .finally(() => setLoading(false));
  }, []);

  const students = users.filter(u => u.role?.toLowerCase() === "user");

  const stats = [
    { label: "Total students",    value: students.length,    icon: "👥", color: "text-indigo-600 dark:text-indigo-400",  bg: "bg-indigo-50 dark:bg-indigo-900/30"  },
    { label: "Active courses",    value: courses.length,     icon: "📚", color: "text-cyan-600 dark:text-cyan-400",      bg: "bg-cyan-50 dark:bg-cyan-900/30"      },
    { label: "Total enrollments", value: enrollments.length, icon: "🎓", color: "text-emerald-600 dark:text-emerald-400",bg: "bg-emerald-50 dark:bg-emerald-900/30"},
    { label: "All users",         value: users.length,       icon: "👤", color: "text-amber-600 dark:text-amber-400",    bg: "bg-amber-50 dark:bg-amber-900/30"    },
  ];

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Overview</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Platform statistics</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className={`${card} p-5 flex items-center gap-4`}>
            <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center text-xl shrink-0`}>{s.icon}</div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Courses table */}
        <div className={`${card} overflow-hidden`}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Recent Courses</h2>
            <Link to="/admin/courses" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {courses.slice(0, 5).map(c => (
              <div key={c.course_id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-base shrink-0">📘</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{c.title}</p>
                  <p className="text-xs text-gray-400">{c.lessons?.length ?? 0} lessons</p>
                </div>
              </div>
            ))}
            {courses.length === 0 && <p className="text-center text-sm text-gray-400 py-8">No courses yet</p>}
          </div>
        </div>

        {/* Students table */}
        <div className={`${card} overflow-hidden`}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Recent Students</h2>
            <Link to="/admin/students" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {students.slice(0, 5).map((u, i) => (
              <div key={u.user_id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 text-xs font-bold shrink-0">
                  {(u.name ?? u.email).slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{u.name ?? "—"}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
              </div>
            ))}
            {students.length === 0 && <p className="text-center text-sm text-gray-400 py-8">No students yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
