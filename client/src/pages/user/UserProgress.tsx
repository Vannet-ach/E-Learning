import { useEffect, useState } from "react";
import { progressApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import type { Progress } from "../../types";

export default function UserProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!user) return;
    progressApi.getByUser(user.user_id)
      .then(r => setProgress(r.data))
      .finally(() => setLoading(false));
  }, [user]);

  const done = progress.filter(p => p.status === "completed").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Progress</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Your lesson completion history</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="notion-card px-4 py-4">
          <p className="text-xs text-slate-400 mb-1">Completed</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">{done}</p>
        </div>
        <div className="notion-card px-4 py-4">
          <p className="text-xs text-slate-400 mb-1">In progress</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">{progress.length - done}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : progress.length === 0 ? (
        <div className="notion-card px-5 py-10 text-center text-slate-400 text-sm">No progress yet. Start a lesson!</div>
      ) : (
        <div className="notion-card overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-[#333]">
                {["Lesson", "Status"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2a2a2a]">
              {progress.map(p => (
                <tr key={p.progress_id} className="hover:bg-slate-50 dark:hover:bg-[#252525] transition">
                  <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">
                    {p.lesson?.title ?? `Lesson #${p.lesson_id}`}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`notion-badge ${
                      p.status === "completed"
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                        : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                    }`}>
                      {p.status === "completed" ? "✓ Completed" : "⏳ In progress"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
