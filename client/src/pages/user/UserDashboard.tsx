import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { enrollmentsApi, progressApi, coursesApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import type { Enrollment, Progress, Course } from "../../types";

export default function UserDashboard() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progress,    setProgress]    = useState<Progress[]>([]);
  const [allCourses,  setAllCourses]  = useState<Course[]>([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      enrollmentsApi.getByUser(user.user_id),
      progressApi.getByUser(user.user_id),
      coursesApi.getAll(),
    ]).then(([e, p, c]) => { setEnrollments(e.data); setProgress(p.data); setAllCourses(c.data); })
      .finally(() => setLoading(false));
  }, [user]);

  const completedCount = progress.filter(p => p.status === "completed").length;

  if (loading) return (
    <div className="flex justify-center py-24">
      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
          Good day, {user?.name?.split(" ")[0] ?? "Student"} 👋
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Here's where you left off.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Enrolled",      value: enrollments.length  },
          { label: "Lessons done",  value: completedCount      },
          { label: "Total courses", value: allCourses.length   },
        ].map((s, i) => (
          <div key={i} className="notion-card px-4 py-4">
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">{s.label}</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Continue learning */}
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-700 dark:text-slate-300">Continue learning</h2>
        <button onClick={() => navigate("/dashboard/courses")}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">View all</button>
      </div>

      <div className="space-y-2">
        {enrollments.slice(0, 4).map((e) => {
          const course  = e.course ?? allCourses.find(c => c.course_id === e.course_id);
          const lessons = course?.lessons ?? [];
          const done    = progress.filter(p => p.status === "completed" && lessons.some(l => l.lesson_id === p.lesson_id)).length;
          const pct     = lessons.length > 0 ? Math.round((done / lessons.length) * 100) : 0;
          if (!course) return null;
          return (
            <div key={e.enrollment_id}
              onClick={() => navigate(`/dashboard/courses/${course.course_id}/lessons`)}
              className="notion-card flex items-center gap-4 px-4 py-3.5 cursor-pointer
                         hover:bg-slate-50 dark:hover:bg-[#2a2a2a] transition group">
              {/* Thumbnail */}
              <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 bg-slate-100 dark:bg-[#2f2f2f]">
                {(course as any).image_url
                  ? <img src={(course as any).image_url} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-lg">📘</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{course.title}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1 bg-slate-200 dark:bg-[#333] rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{pct}%</span>
                </div>
              </div>
              <span className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 text-sm">→</span>
            </div>
          );
        })}
        {enrollments.length === 0 && (
          <div className="notion-card px-5 py-10 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">You haven't enrolled in any course yet.</p>
            <button onClick={() => navigate("/dashboard/courses")}
              className="notion-btn-primary">Browse courses</button>
          </div>
        )}
      </div>
    </div>
  );
}
