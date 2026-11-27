import { useEffect, useState, useRef } from "react";
import { coursesApi, uploadApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import type { Course } from "../../types";
import { card, inp, lbl, btnPrimary, btnGhost } from "../../styles";

const GRADS = ["from-indigo-500 to-purple-600","from-cyan-500 to-blue-600","from-emerald-500 to-teal-600","from-orange-500 to-rose-500","from-pink-500 to-purple-600"];

export default function AdminCourses() {
  const { user } = useAuth();
  const [courses, setCourses]       = useState<Course[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editTarget, setEditTarget] = useState<Course | null>(null);
  const [form, setForm]             = useState({ title: "", description: "", image_url: "" });
  const [saving, setSaving]         = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [preview, setPreview]       = useState("");
  const [error, setError]           = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try { const r = await coursesApi.getAll(); setCourses(r.data); }
    catch { setError("Failed to load courses."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditTarget(null); setForm({ title: "", description: "", image_url: "" }); setPreview(""); setShowForm(true); };
  const openEdit = (c: Course) => { setEditTarget(c); setForm({ title: c.title, description: c.description ?? "", image_url: (c as any).image_url ?? "" }); setPreview((c as any).image_url ?? ""); setShowForm(true); };

  const handleImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setPreview(URL.createObjectURL(file)); setUploading(true);
    try { const url = await uploadApi.image(file); setForm(f => ({ ...f, image_url: url })); setPreview(url); }
    catch { setError("Image upload failed. Make sure backend is running."); setPreview(""); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.title.trim()) return; setSaving(true);
    try {
      if (editTarget) await coursesApi.update(editTarget.course_id, { ...form } as any);
      else await coursesApi.create({ ...form, user_id: user?.user_id } as any);
      setShowForm(false); load();
    } catch { setError("Failed to save."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this course?")) return;
    try { await coursesApi.delete(id); setCourses(p => p.filter(c => c.course_id !== id)); }
    catch { setError("Failed to delete."); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Courses</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{courses.length} courses total</p>
        </div>
        <button onClick={openCreate} className={btnPrimary}>+ New course</button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400 flex justify-between">
          <span>⚠️ {error}</span><button onClick={() => setError("")} className="ml-2">✕</button>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-bold text-gray-900 dark:text-white">{editTarget ? "Edit Course" : "New Course"}</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition">✕</button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div><label className={lbl}>Course title *</label><input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. React + TypeScript" className={inp} /></div>
              <div><label className={lbl}>Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="What will students learn?" className={inp + " resize-none"} /></div>
              <div>
                <label className={lbl}>Cover image <span className="font-normal text-gray-400 text-xs">(JPG, PNG, max 5MB)</span></label>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImg} className="hidden" />
                {preview ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 h-40 group">
                    <img src={preview} alt="preview" className="w-full h-full object-cover" />
                    {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /></div>}
                    {!uploading && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <button onClick={() => fileRef.current?.click()} className="px-3 py-1.5 bg-white text-gray-800 text-xs font-semibold rounded-lg">Change</button>
                        <button onClick={() => { setPreview(""); setForm(f => ({ ...f, image_url: "" })); }} className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg">Remove</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button onClick={() => fileRef.current?.click()} className="w-full h-36 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition flex flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-500">
                    <span className="text-3xl">🖼️</span>
                    <span className="text-sm font-medium">Click to upload image</span>
                    <span className="text-xs">JPG, PNG, WebP up to 5MB</span>
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowForm(false)} className={btnGhost + " flex-1"}>Cancel</button>
              <button onClick={handleSave} disabled={saving || uploading || !form.title.trim()} className={btnPrimary + " flex-1 flex items-center justify-center gap-2"}>
                {saving && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                {uploading ? "Uploading…" : saving ? "Saving…" : editTarget ? "Save changes" : "Create course"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {courses.map((c, i) => {
            const img = (c as any).image_url;
            return (
              <div key={c.course_id} className={`${card} overflow-hidden hover:shadow-md transition-shadow group`}>
                <div className="h-40 relative overflow-hidden">
                  {img ? <img src={img} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                       : <div className={`w-full h-full bg-gradient-to-br ${GRADS[i%GRADS.length]} flex items-center justify-center`}><span className="text-5xl opacity-70">📘</span></div>}
                  <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
                    {c.lessons?.length ?? 0} lessons
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1 truncate">{c.title}</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 min-h-[2rem] mb-4">{c.description || "No description."}</p>
                  <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <button onClick={() => openEdit(c)} className="flex-1 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition">✏️ Edit</button>
                    <button onClick={() => handleDelete(c.course_id)} className="flex-1 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">🗑️ Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
          {courses.length === 0 && (
            <div className={`col-span-3 ${card} p-16 text-center`}>
              <p className="text-gray-400 mb-4">No courses yet</p>
              <button onClick={openCreate} className={btnPrimary}>Create first course</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
