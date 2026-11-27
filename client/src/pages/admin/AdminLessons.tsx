import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { lessonsApi, coursesApi, uploadApi } from "../../services/api";
import type { Lesson, Course } from "../../types";
import { card, inp, lbl, btnPrimary, btnGhost } from "../../styles";

const COLORS = ["bg-indigo-500","bg-cyan-500","bg-emerald-500","bg-amber-500","bg-rose-500"];

export default function AdminLessons() {
  const navigate = useNavigate();
  const [lessons, setLessons]     = useState<Lesson[]>([]);
  const [courses, setCourses]     = useState<Course[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState<Lesson | null>(null);
  const [form, setForm]           = useState({ title: "", video_url: "", lesson_order: 1, course_id: 0 });
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [error, setError]         = useState("");
  const [expanded, setExpanded]   = useState<Set<number>>(new Set());
  const videoRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const [l, c] = await Promise.all([lessonsApi.getAll(), coursesApi.getAll()]);
      setLessons(l.data); setCourses(c.data);
      setExpanded(new Set(c.data.map((x: Course) => x.course_id)));
    } catch { setError("Failed to load."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = (cid = 0) => { setEditTarget(null); setForm({ title: "", video_url: "", lesson_order: 1, course_id: cid || courses[0]?.course_id || 0 }); setUploadPct(0); setShowForm(true); };
  const openEdit   = (l: Lesson) => { setEditTarget(l); setForm({ title: l.title, video_url: l.video_url ?? "", lesson_order: l.lesson_order, course_id: l.course_id }); setUploadPct(0); setShowForm(true); };

  const handleVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true); setUploadPct(0);
    try { const url = await uploadApi.video(file, p => setUploadPct(p)); setForm(f => ({ ...f, video_url: url })); }
    catch { setError("Video upload failed. Make sure backend is running."); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.course_id) return; setSaving(true);
    try {
      if (editTarget) await lessonsApi.update(editTarget.lesson_id, form);
      else await lessonsApi.create(form);
      setShowForm(false); setEditTarget(null); load();
    } catch { setError("Failed to save."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this lesson?")) return;
    try { await lessonsApi.delete(id); setLessons(p => p.filter(l => l.lesson_id !== id)); }
    catch { setError("Failed to delete."); }
  };

  const toggle = (id: number) => setExpanded(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const grouped = courses.map(c => ({ course: c, lessons: lessons.filter(l => l.course_id === c.course_id).sort((a,b) => a.lesson_order - b.lesson_order) }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lessons</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{lessons.length} lessons across {courses.length} courses</p>
        </div>
        <button onClick={() => openCreate()} className={btnPrimary}>+ New lesson</button>
      </div>

      {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400 flex justify-between"><span>⚠️ {error}</span><button onClick={() => setError("")}>✕</button></div>}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-bold text-gray-900 dark:text-white">{editTarget ? "Edit Lesson" : "New Lesson"}</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition">✕</button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div><label className={lbl}>Lesson title *</label><input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Introduction to Hooks" className={inp} /></div>
              <div>
                <label className={lbl}>Course *</label>
                <select value={form.course_id} onChange={e => setForm(f => ({ ...f, course_id: Number(e.target.value) }))} className={inp}>
                  <option value={0}>Select a course…</option>
                  {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Video file <span className="font-normal text-gray-400 text-xs">(MP4, WebM — max 500MB)</span></label>
                <input ref={videoRef} type="file" accept="video/*" onChange={handleVideo} className="hidden" />
                {form.video_url ? (
                  <div className={`${card} overflow-hidden`}>
                    <video src={form.video_url} controls className="w-full max-h-40 bg-black" />
                    <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800">
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">✓ Video uploaded</span>
                      <div className="flex gap-3">
                        <button onClick={() => videoRef.current?.click()} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Change</button>
                        <button onClick={() => { setForm(f => ({ ...f, video_url: "" })); if (videoRef.current) videoRef.current.value = ""; }} className="text-xs text-red-500 hover:underline">Remove</button>
                      </div>
                    </div>
                  </div>
                ) : uploading ? (
                  <div className={`${card} p-5`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin shrink-0" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploading… {uploadPct}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${uploadPct}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Please wait — do not close this window</p>
                  </div>
                ) : (
                  <button onClick={() => videoRef.current?.click()} className="w-full h-28 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition flex flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-500">
                    <span className="text-3xl">🎬</span>
                    <span className="text-sm font-medium">Click to upload video from PC</span>
                    <span className="text-xs">MP4, WebM, MOV up to 500MB</span>
                  </button>
                )}
              </div>
              <div><label className={lbl}>Lesson order</label><input type="number" min={1} value={form.lesson_order} onChange={e => setForm(f => ({ ...f, lesson_order: Number(e.target.value) }))} className={inp + " w-24"} /></div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowForm(false)} className={btnGhost + " flex-1"}>Cancel</button>
              <button onClick={handleSave} disabled={saving || uploading || !form.title.trim() || !form.course_id} className={btnPrimary + " flex-1 flex items-center justify-center gap-2"}>
                {saving && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                {uploading ? "Uploading…" : saving ? "Saving…" : editTarget ? "Save changes" : "Create lesson"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {grouped.map(({ course, lessons: cl }, ci) => (
            <div key={course.course_id} className={`${card} overflow-hidden`}>
              <button onClick={() => toggle(course.course_id)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition text-left">
                <div className={`w-1 h-8 rounded-full ${COLORS[ci%COLORS.length]} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{course.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{cl.length} lesson{cl.length !== 1 ? "s" : ""}</p>
                </div>
                <span className={`text-gray-400 text-xs transition-transform duration-200 ${expanded.has(course.course_id) ? "rotate-180" : ""}`}>▼</span>
              </button>
              {expanded.has(course.course_id) && (
                <div className="border-t border-gray-100 dark:border-gray-800">
                  {cl.length === 0 ? (
                    <div className="px-5 py-6 text-center text-sm text-gray-400">No lessons yet. <button onClick={() => openCreate(course.course_id)} className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Add one</button></div>
                  ) : (
                    <table className="w-full text-sm border-collapse">
                      <thead className="bg-gray-50 dark:bg-gray-800/50">
                        <tr>{["#","Title","Video","Quiz","Actions"].map(h => <th key={h} className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>)}</tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {cl.map(lesson => (
                          <tr key={lesson.lesson_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
                            <td className="px-5 py-3"><span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs font-bold flex items-center justify-center">{lesson.lesson_order}</span></td>
                            <td className="px-5 py-3 font-semibold text-gray-800 dark:text-gray-200">🎬 {lesson.title}</td>
                            <td className="px-5 py-3">
                              {lesson.video_url ? <a href={lesson.video_url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Watch ↗</a>
                                                : <span className="text-xs text-gray-300 dark:text-gray-600">—</span>}
                            </td>
                            <td className="px-5 py-3"><button onClick={() => navigate(`/admin/quiz/${lesson.lesson_id}`)} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium">Manage quiz</button></td>
                            <td className="px-5 py-3">
                              <div className="flex gap-3">
                                <button onClick={() => openEdit(lesson)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Edit</button>
                                <button onClick={() => handleDelete(lesson.lesson_id)} className="text-xs text-red-500 hover:underline font-medium">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
          {courses.length === 0 && <div className={`${card} p-12 text-center text-sm text-gray-400`}>No courses found. Create a course first.</div>}
        </div>
      )}
    </div>
  );
}
