import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizzesApi, answersApi, lessonsApi } from "../../services/api";
import type { Quiz, Answer } from "../../types";

export default function AdminQuiz() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate     = useNavigate();
  const [lessonTitle, setLessonTitle] = useState("");
  const [quizzes, setQuizzes]         = useState<Quiz[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [showQuizForm, setShowQuizForm]   = useState(false);
  const [editQuiz, setEditQuiz]           = useState<Quiz | null>(null);
  const [quizQ, setQuizQ]                 = useState("");
  const [savingQuiz, setSavingQuiz]       = useState(false);
  const [showAnsForm, setShowAnsForm]     = useState<number | null>(null);
  const [editAnswer, setEditAnswer]       = useState<Answer | null>(null);
  const [ansForm, setAnsForm]             = useState({ answer: "", is_correct: false });
  const [savingAns, setSavingAns]         = useState(false);

  const load = async () => {
    if (!lessonId) return;
    try {
      const [q, l] = await Promise.all([quizzesApi.getAll(), lessonsApi.getById(Number(lessonId))]);
      setLessonTitle(l.data.title);
      const filtered = q.data.filter((q: Quiz) => q.lesson_id === Number(lessonId));
      const withAns  = await Promise.all(filtered.map(async (q: Quiz) => ({ ...q, answers: (await quizzesApi.getAnswers(q.quiz_id)).data })));
      setQuizzes(withAns);
    } catch { setError("Failed to load."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [lessonId]);

  const handleSaveQuiz = async () => {
    if (!quizQ.trim() || !lessonId) return; setSavingQuiz(true);
    try {
      if (editQuiz) await quizzesApi.update(editQuiz.quiz_id, { question: quizQ });
      else await quizzesApi.create({ lesson_id: Number(lessonId), question: quizQ });
      setShowQuizForm(false); setEditQuiz(null); load();
    } catch { setError("Failed to save quiz."); }
    finally { setSavingQuiz(false); }
  };

  const handleDeleteQuiz = async (id: number) => {
    if (!confirm("Delete this question?")) return;
    try { await quizzesApi.delete(id); load(); }
    catch { setError("Failed to delete."); }
  };

  const handleSaveAns = async () => {
    if (!ansForm.answer.trim() || !showAnsForm) return; setSavingAns(true);
    try {
      if (editAnswer) await answersApi.update(editAnswer.answer_id, ansForm);
      else await answersApi.create({ quiz_id: showAnsForm, ...ansForm });
      setShowAnsForm(null); setEditAnswer(null); load();
    } catch { setError("Failed to save answer."); }
    finally { setSavingAns(false); }
  };

  const handleDeleteAns = async (id: number) => {
    if (!confirm("Delete this answer?")) return;
    try { await answersApi.delete(id); load(); }
    catch { setError("Failed to delete."); }
  };

  const Modal = ({ title, onClose, children, onSave, saving, disabled }: any) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#252525] rounded-xl border border-slate-200 dark:border-[#333] shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[#333]">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{title}</h3>
          <button onClick={onClose} className="notion-btn-ghost w-7 h-7 p-0 flex items-center justify-center text-slate-400">✕</button>
        </div>
        <div className="px-6 py-5 space-y-4">{children}</div>
        <div className="flex gap-2 px-6 pb-5">
          <button onClick={onClose} className="flex-1 notion-btn-ghost border border-slate-200 dark:border-[#333] py-2">Cancel</button>
          <button onClick={onSave} disabled={saving || disabled}
            className="flex-1 notion-btn-primary py-2 flex items-center justify-center gap-2 disabled:opacity-50">
            {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <button onClick={() => navigate("/admin/lessons")} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition mb-3 flex items-center gap-1">
          ← Back to lessons
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Quiz</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{lessonTitle}</p>
          </div>
          <button onClick={() => { setEditQuiz(null); setQuizQ(""); setShowQuizForm(true); }} className="notion-btn-primary flex items-center gap-1.5">
            <span>+</span> Add question
          </button>
        </div>
      </div>

      {error && <div className="mb-4 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-3 py-2 flex justify-between"><span>{error}</span><button onClick={() => setError("")}>✕</button></div>}

      {showQuizForm && (
        <Modal title={editQuiz ? "Edit question" : "New question"} onClose={() => setShowQuizForm(false)}
          onSave={handleSaveQuiz} saving={savingQuiz} disabled={!quizQ.trim()}>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Question</label>
            <textarea placeholder="e.g. What is a React Hook?" value={quizQ} onChange={e => setQuizQ(e.target.value)}
              rows={3} className="notion-input resize-none" />
          </div>
        </Modal>
      )}

      {showAnsForm !== null && (
        <Modal title={editAnswer ? "Edit answer" : "New answer"} onClose={() => { setShowAnsForm(null); setEditAnswer(null); }}
          onSave={handleSaveAns} saving={savingAns} disabled={!ansForm.answer.trim()}>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Answer text</label>
            <input type="text" placeholder="Enter answer…" value={ansForm.answer}
              onChange={e => setAnsForm(f => ({ ...f, answer: e.target.value }))} className="notion-input" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Correct?</label>
            <div className="flex gap-2">
              {[true, false].map(v => (
                <button key={String(v)} onClick={() => setAnsForm(f => ({ ...f, is_correct: v }))}
                  className={`flex-1 py-2 rounded-md text-sm font-medium border-2 transition ${
                    ansForm.is_correct === v
                      ? v ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                          : "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                      : "border-slate-200 dark:border-[#333] text-slate-500"
                  }`}>
                  {v ? "✅ Correct" : "❌ Wrong"}
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : quizzes.length === 0 ? (
        <div className="notion-card p-14 text-center">
          <p className="text-slate-400 text-sm mb-3">No questions yet</p>
          <button onClick={() => { setEditQuiz(null); setQuizQ(""); setShowQuizForm(true); }} className="notion-btn-primary">Add first question</button>
        </div>
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz, qi) => (
            <div key={quiz.quiz_id} className="notion-card overflow-hidden">
              <div className="flex items-start gap-3 px-5 py-4 border-b border-slate-100 dark:border-[#2a2a2a]">
                <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">{qi+1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{quiz.question}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {(quiz.answers?.length ?? 0) === 0 && <span className="notion-badge bg-red-50 dark:bg-red-900/20 text-red-500">⚠️ No answers</span>}
                    {(quiz.answers?.length ?? 0) > 0 && !quiz.answers?.some(a => a.is_correct) && <span className="notion-badge bg-amber-50 dark:bg-amber-900/20 text-amber-600">⚠️ No correct answer</span>}
                    {quiz.answers?.some(a => a.is_correct) && <span className="notion-badge bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">✓ Ready</span>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => { setEditQuiz(quiz); setQuizQ(quiz.question); setShowQuizForm(true); }} className="notion-btn-ghost text-xs px-2 py-1">Edit</button>
                  <button onClick={() => handleDeleteQuiz(quiz.quiz_id)} className="notion-btn-ghost text-xs px-2 py-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10">Delete</button>
                </div>
              </div>

              <div className="px-5 py-3">
                <div className="space-y-2 mb-3">
                  {(quiz.answers ?? []).map(ans => (
                    <div key={ans.answer_id} className={`flex items-center gap-3 px-3 py-2.5 rounded-md border ${
                      ans.is_correct ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800" : "bg-slate-50 dark:bg-[#2a2a2a] border-slate-200 dark:border-[#333]"}`}>
                      <span className="text-sm shrink-0">{ans.is_correct ? "✅" : "⭕"}</span>
                      <span className={`flex-1 text-sm ${ans.is_correct ? "font-medium text-emerald-700 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400"}`}>{ans.answer}</span>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditAnswer(ans); setAnsForm({ answer: ans.answer, is_correct: ans.is_correct }); setShowAnsForm(ans.quiz_id); }} className="text-xs text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">Edit</button>
                        <button onClick={() => handleDeleteAns(ans.answer_id)} className="text-xs text-slate-400 hover:text-red-500 transition ml-1">✕</button>
                      </div>
                    </div>
                  ))}
                  {(quiz.answers?.length ?? 0) === 0 && <p className="text-xs text-slate-400 py-1">No answers yet.</p>}
                </div>
                <button onClick={() => { setEditAnswer(null); setAnsForm({ answer: "", is_correct: false }); setShowAnsForm(quiz.quiz_id); }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1">
                  + Add answer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
