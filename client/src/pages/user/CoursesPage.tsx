import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { enrollmentsApi, progressApi, coursesApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import type { Enrollment, Progress, Course } from "../../types";

const GRADIENTS = ["from-violet-500 to-indigo-500","from-blue-500 to-cyan-500","from-emerald-500 to-teal-500","from-orange-500 to-amber-500","from-rose-500 to-pink-500"];

export default function CoursesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progress,    setProgress]    = useState<Progress[]>([]);
  const [allCourses,  setAllCourses]  = useState<Course[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [enrolling,   setEnrolling]   = useState<number | null>(null);
  const [error,       setError]       = useState("");
  const [tab,         setTab]         = useState<"enrolled"|"browse">("enrolled");

  useEffect(() => {
    if (!user) return;
    Promise.all([enrollmentsApi.getByUser(user.user_id), progressApi.getByUser(user.user_id), coursesApi.getAll()])
      .then(([e, p, c]) => { setEnrollments(e.data); setProgress(p.data); setAllCourses(c.data); })
      .catch(() => setError("Failed to load."))
      .finally(() => setLoading(false));
  }, [user]);

  const handleEnroll = async (course_id: number) => {
    if (!user) return; setEnrolling(course_id);
    try { const r = await enrollmentsApi.enroll(user.user_id, course_id); setEnrollments(p => [...p, r.data]); setTab("enrolled"); }
    catch { setError("Failed to enroll."); }
    finally { setEnrolling(null); }
  };

  const enrolledIds = new Set(enrollments.map(e => e.course_id));
  const notEnrolled = allCourses.filter(c => !enrolledIds.has(c.course_id));

  if (loading) return <div className="flex justify-center py-24"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Courses</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Your learning library</p>
      </div>

      {error && <div className="mb-4 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200 dark:border-[#2a2a2a]">
        {([{ key:"enrolled", label:`My courses (${enrollments.length})` }, { key:"browse", label:`Browse (${notEnrolled.length})` }] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              tab === t.key
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}>{t.label}
          </button>
        ))}
      </div>

      {/* Enrolled */}
      {tab === "enrolled" && (
        enrollments.length === 0 ? (
          <div className="notion-card p-12 text-center">
            <p className="text-slate-400 text-sm mb-3">No courses enrolled yet</p>
            <button onClick={() => setTab("browse")} className="notion-btn-primary">Browse courses</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {enrollments.map((e, idx) => {
              const course  = e.course ?? allCourses.find(c => c.course_id === e.course_id);
              const lessons = course?.lessons ?? [];
              const done    = progress.filter(p => p.status === "completed" && lessons.some(l => l.lesson_id === p.lesson_id)).length;
              const pct     = lessons.length > 0 ? Math.round((done / lessons.length) * 100) : 0;
              if (!course) return null;
              const img = (course as any).image_url;
              return (
                <div key={e.enrollment_id} className="notion-card overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="h-36 relative overflow-hidden">
                    {img
                      ? <img src={img} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className={`w-full h-full bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]} flex items-center justify-center`}><span className="text-4xl opacity-80">📘</span></div>
                    }
                    {pct === 100 && (
                      <span className="absolute top-2.5 right-2.5 text-xs font-medium bg-emerald-500 text-white px-2 py-0.5 rounded-full">✓ Done</span>
                    )}
                    <span className="absolute top-2.5 left-2.5 text-xs font-medium bg-black/40 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
                      {lessons.length} lessons
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-slate-900 dark:text-white text-sm mb-1 truncate">{course.title}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 h-1 bg-slate-100 dark:bg-[#333] rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-slate-400 shrink-0">{pct}%</span>
                    </div>
                    <button onClick={() => navigate(`/dashboard/courses/${course.course_id}/lessons`)}
                      className="w-full py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400
                                 border border-indigo-200 dark:border-indigo-800 rounded-md
                                 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition">
                      {pct === 100 ? "Review" : pct > 0 ? "Continue →" : "Start →"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Browse */}
      {tab === "browse" && (
        notEnrolled.length === 0 ? (
          <div className="notion-card p-12 text-center text-slate-400 text-sm">You're enrolled in all available courses! 🎉</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {notEnrolled.map((c, idx) => {
              const img = (c as any).image_url;
              return (
                <div key={c.course_id} className="notion-card overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="h-36 relative overflow-hidden">
                    {img
                      ? <img src={img} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className={`w-full h-full bg-gradient-to-br ${GRADIENTS[(enrollments.length + idx) % GRADIENTS.length]} flex items-center justify-center`}><span className="text-4xl opacity-80">📗</span></div>
                    }
                    <span className="absolute top-2.5 left-2.5 text-xs font-medium bg-black/40 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
                      {c.lessons?.length ?? 0} lessons
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-slate-900 dark:text-white text-sm mb-1 truncate">{c.title}</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 min-h-[2rem] mb-3">{(c as any).description || "No description"}</p>
                    <button onClick={() => handleEnroll(c.course_id)} disabled={enrolling === c.course_id}
                      className="w-full py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700
                                 disabled:opacity-60 rounded-md transition flex items-center justify-center gap-1.5">
                      {enrolling === c.course_id
                        ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Enrolling…</>
                        : "Enroll now"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
