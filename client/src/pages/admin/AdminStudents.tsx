import { useEffect, useState } from "react";
import { usersApi } from "../../services/api";
import type { User } from "../../types";
import { card } from "../../styles";

export default function AdminStudents() {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [error, setError]       = useState("");

  useEffect(() => {
    usersApi.getAll()
      .then(r => setStudents(r.data.filter((u: User) => u.role?.toLowerCase() === "user")))
      .catch(() => setError("Failed to load students."))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this student?")) return;
    try { await usersApi.delete(id); setStudents(p => p.filter(s => s.user_id !== id)); }
    catch { setError("Failed to delete."); }
  };

  const filtered = students.filter(s =>
    (s.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Students</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{students.length} students enrolled</p>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students…"
          className="px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52" />
      </div>

      {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">⚠️ {error}</div>}

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className={`${card} overflow-hidden`}>
          <table className="w-full text-sm border-collapse">
            <thead className="border-b border-gray-100 dark:border-gray-800">
              <tr>
                {["Student","Email","ID","Action"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map(s => (
                <tr key={s.user_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 text-xs font-bold shrink-0">
                        {(s.name ?? s.email).slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{s.name ?? "—"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{s.email}</td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">#{s.user_id}</td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => handleDelete(s.user_id)} className="text-xs text-red-500 hover:underline font-medium">Delete</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="text-center text-gray-400 py-12">No students found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
