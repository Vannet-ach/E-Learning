import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { coursesApi, progressApi, quizzesApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import type { Lesson, Progress, Quiz } from "../../types";

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return m ? m[1] : null;
}

// per-question state
interface QState {
  picked: number | null;   // answer_id chosen
  correct: boolean | null; // null = not answered yet
}

export default function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const [lessons,  setLessons]  = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [quizzes,  setQuizzes]  = useState<Quiz[]>([]);
  const [qState,   setQState]   = useState<Record<number, QState>>({});
  const [loading,  setLoading]  = useState(true);
  const [marking,  setMarking]  = useState(false);
  const [error,    setError]    = useState("");

  const currentLesson = lessons.find((l) => l.lesson_id === Number(lessonId));
  const currentIdx    = lessons.findIndex((l) => l.lesson_id === Number(lessonId));
  const prevLesson    = currentIdx > 0 ? lessons[currentIdx - 1] : null;
  const nextLesson    = currentIdx < lessons.length - 1 ? lessons[currentIdx + 1] : null;

  // all quizzes passed?
  const allPassed = quizzes.length === 0 ||
    quizzes.every((q) => qState[q.quiz_id]?.correct === true);

  useEffect(() => {
    if (!courseId || !user) return;
    setLoading(true);
    Promise.all([
      coursesApi.getLessons(Number(courseId)),
      progressApi.getByUser(user.user_id),
    ]).then(([l, p]) => {
      const sorted = [...l.data].sort((a, b) => a.lesson_order - b.lesson_order);
      setLessons(sorted);
      setProgress(p.data);
      if (!lessonId && sorted.length > 0)
        navigate(`/dashboard/courses/${courseId}/lessons/${sorted[0].lesson_id}`, { replace: true });
    }).catch(() => setError("Failed to load."))
      .finally(() => setLoading(false));
  }, [courseId, user]);

  // reload quizzes when lesson changes
  useEffect(() => {
    if (!lessonId) return;
    setQuizzes([]);
    setQState({});
    quizzesApi.getAll().then((res) => {
      const filtered = res.data.filter((q: Quiz) => q.lesson_id === Number(lessonId));
      Promise.all(
        filtered.map((q: Quiz) =>
          quizzesApi.getAnswers(q.quiz_id).then((ans) => ({ ...q, answers: ans.data }))
        )
      ).then((withAns) => {
        setQuizzes(withAns);
        const init: Record<number, QState> = {};
        withAns.forEach((q) => { init[q.quiz_id] = { picked: null, correct: null }; });
        setQState(init);
      });
    });
  }, [lessonId]);

  useEffect(() => {
    const el = document.getElementById(`lesson-item-${lessonId}`);
    if (el && sidebarRef.current) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [lessonId]);

  const isDone = (lid: number) =>
    progress.some((p) => p.lesson_id === lid && p.status === "completed");

  // ── User clicks an answer ──
  const pickAnswer = (quiz_id: number, answer_id: number, is_correct: boolean) => {
    // already answered correctly → ignore
    if (qState[quiz_id]?.correct === true) return;
    setQState((prev) => ({
      ...prev,
      [quiz_id]: { picked: answer_id, correct: is_correct },
    }));
  };

  const handleMarkDone = async () => {
    if (!user || !currentLesson) return;
    setMarking(true);
    try {
      const existing = progress.find((p) => p.lesson_id === currentLesson.lesson_id);
      if (existing) {
        await progressApi.update(existing.progress_id, { status: "completed" });
      } else {
        await progressApi.create({ user_id: user.user_id, lesson_id: currentLesson.lesson_id, status: "completed" });
      }
      setProgress((prev) => [
        ...prev.filter((p) => p.lesson_id !== currentLesson.lesson_id),
        { progress_id: 0, user_id: user.user_id, lesson_id: currentLesson.lesson_id, status: "completed" },
      ]);
    } catch { setError("Failed to save progress."); }
    finally { setMarking(false); }
  };

  const goTo = (lid: number) =>
    navigate(`/dashboard/courses/${courseId}/lessons/${lid}`);

  const handleNext = async () => {
    if (!isDone(currentLesson!.lesson_id)) await handleMarkDone();
    if (nextLesson) goTo(nextLesson.lesson_id);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const ytId = currentLesson?.video_url ? getYouTubeId(currentLesson.video_url) : null;
  const doneCnt = lessons.filter((l) => isDone(l.lesson_id)).length;
  const donePct = lessons.length > 0 ? Math.round((doneCnt / lessons.length) * 100) : 0;

  return (
    <div className="flex -m-7 min-h-screen">

      {/* ══ SIDEBAR ══ */}
      <aside ref={sidebarRef}
        className="w-72 shrink-0 flex flex-col h-screen sticky top-0 overflow-hidden
                   bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700">
        <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-700 shrink-0">
          <button onClick={() => navigate("/dashboard/courses")}
            className="text-xs text-slate-400 hover:text-indigo-500 transition mb-3 flex items-center gap-1">
            ← Back to courses
          </button>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 truncate">Course #{courseId}</p>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">{doneCnt}/{lessons.length} done</span>
            <span className="font-bold text-indigo-500">{donePct}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${donePct}%` }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {lessons.map((lesson, idx) => {
            const active = lesson.lesson_id === Number(lessonId);
            const done   = isDone(lesson.lesson_id);
            return (
              <button id={`lesson-item-${lesson.lesson_id}`} key={lesson.lesson_id}
                onClick={() => goTo(lesson.lesson_id)}
                className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-all border-l-[3px] ${
                  active ? "bg-indigo-50 dark:bg-indigo-900/30 border-l-indigo-500"
                         : "border-l-transparent hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                  done    ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600"
                  : active ? "bg-indigo-600 text-white"
                           : "bg-slate-100 dark:bg-slate-700 text-slate-400"}`}>
                  {done ? "✓" : idx + 1}
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-semibold line-clamp-2 leading-relaxed ${
                    active ? "text-indigo-700 dark:text-indigo-300" : "text-slate-700 dark:text-slate-300"}`}>
                    {lesson.title}
                  </p>
                  {lesson.video_url && <span className="text-xs text-slate-400 mt-0.5 block">🎬 Video</span>}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
        {error && (
          <div className="m-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3">
            ⚠️ {error}
          </div>
        )}

        {currentLesson && (
          <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

            {/* Header */}
            <div>
              <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
                Lesson {currentIdx + 1} of {lessons.length}
              </span>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {currentLesson.title}
              </h1>
            </div>

            {/* Video */}
            {currentLesson.video_url && (
              <div className="rounded-2xl overflow-hidden shadow-lg bg-black">
                {ytId ? (
                  <div className="relative aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
                      title={currentLesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen className="w-full h-full absolute inset-0"
                    />
                  </div>
                ) : (
                  <div className="relative aspect-video bg-black">
                    <video key={currentLesson.video_url} src={currentLesson.video_url}
                      controls controlsList="nodownload"
                      className="w-full h-full absolute inset-0"
                      onError={(e) => {
                        (e.currentTarget.parentElement!).innerHTML =
                          `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:rgba(255,255,255,0.6);gap:12px;padding:24px">
                            <span style="font-size:2.5rem">⚠️</span>
                            <p style="font-size:0.875rem;text-align:center">Cannot play video.</p>
                            <a href="${currentLesson.video_url}" target="_blank" style="color:#818cf8;font-size:0.8rem">Open link ↗</a>
                          </div>`;
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                <span>📝</span> Lesson Notes
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Welcome to <strong className="text-slate-800 dark:text-slate-200">{currentLesson.title}</strong>.
                Watch the video above, then answer the quiz questions below before moving on.
              </p>
              {currentLesson.video_url && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-3 mt-4 flex items-center gap-2">
                  <span className="text-xs text-indigo-500 font-semibold">📌</span>
                  <a href={currentLesson.video_url} target="_blank" rel="noreferrer"
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline break-all">
                    {currentLesson.video_url}
                  </a>
                </div>
              )}
            </div>

            {/* ══ QUIZ ══ */}
            {quizzes.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-base">
                  🧠 Quiz
                  <span className="text-sm font-normal text-slate-400">
                    — {quizzes.filter((q) => qState[q.quiz_id]?.correct).length}/{quizzes.length} correct
                  </span>
                </h2>

                {quizzes.map((quiz, qi) => {
                  const qs      = qState[quiz.quiz_id] ?? { picked: null, correct: null };
                  const answered = qs.correct !== null;
                  const passed   = qs.correct === true;

                  return (
                    <div key={quiz.quiz_id}
                      className={`bg-white dark:bg-slate-800 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                        !answered ? "border-slate-200 dark:border-slate-700"
                        : passed  ? "border-emerald-400 dark:border-emerald-600"
                                  : "border-red-400 dark:border-red-600"
                      }`}>

                      {/* Question */}
                      <div className="px-5 pt-5 pb-2 flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                          !answered ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600"
                          : passed  ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600"
                                    : "bg-red-100 dark:bg-red-900/50 text-red-500"
                        }`}>
                          {!answered ? qi + 1 : passed ? "✓" : "✗"}
                        </div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-relaxed pt-1">
                          {quiz.question}
                        </p>
                      </div>

                      {/* Status hint */}
                      {answered && !passed && (
                        <div className="mx-5 mb-2 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl px-3 py-2">
                          <span className="text-sm">❌</span>
                          <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                            Wrong answer — please choose again
                          </p>
                        </div>
                      )}
                      {answered && passed && (
                        <div className="mx-5 mb-2 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl px-3 py-2">
                          <span className="text-sm">✅</span>
                          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            Correct!
                          </p>
                        </div>
                      )}

                      {/* Answers — click to choose */}
                      <div className="px-5 pb-5 space-y-2.5 ml-11">
                        {quiz.answers?.map((ans) => {
                          const isPicked = qs.picked === ans.answer_id;
                          const showCorrect = passed && ans.is_correct;
                          const showWrong   = answered && !passed && isPicked;

                          let cls = "border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer";
                          if (passed && ans.is_correct) cls = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 cursor-default";
                          else if (passed) cls = "border-slate-200 dark:border-slate-600 text-slate-400 cursor-default opacity-60";
                          else if (showWrong) cls = "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 cursor-pointer";

                          return (
                            <button key={ans.answer_id}
                              onClick={() => pickAnswer(quiz.quiz_id, ans.answer_id, ans.is_correct)}
                              disabled={passed}
                              className={`w-full text-left px-4 py-3 rounded-xl border-2 flex items-center gap-3 transition-all duration-150 ${cls}`}>

                              {/* Circle indicator */}
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                showCorrect ? "border-emerald-500 bg-emerald-500"
                                : showWrong ? "border-red-400 bg-red-400"
                                : isPicked  ? "border-indigo-500 bg-indigo-500"
                                            : "border-slate-300 dark:border-slate-500"
                              }`}>
                                {(isPicked || showCorrect) && (
                                  <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                              </div>

                              <span className="text-sm font-medium flex-1">{ans.answer}</span>

                              {showCorrect && <span className="text-lg shrink-0">✅</span>}
                              {showWrong   && <span className="text-lg shrink-0">❌</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* All passed celebration */}
                {allPassed && quizzes.length > 0 && (
                  <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl p-5 flex items-center gap-4 text-white">
                    <div className="text-4xl">🏆</div>
                    <div>
                      <p className="font-bold text-base">All questions correct!</p>
                      <p className="text-emerald-50 text-sm mt-0.5">
                        Great job! Click "Next lesson" to continue.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══ NAV BAR ══ */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex flex-col sm:flex-row items-center gap-3">

                {/* Mark done */}
                {isDone(currentLesson.lesson_id) ? (
                  <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 text-sm font-semibold rounded-xl">
                    ✅ Completed
                  </div>
                ) : (
                  <button onClick={handleMarkDone} disabled={marking || !allPassed}
                    title={!allPassed ? "Answer all quiz questions first" : ""}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition">
                    {marking ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "✓"}
                    {marking ? "Saving…" : "Mark as done"}
                  </button>
                )}

                <div className="flex gap-2 sm:ml-auto">
                  <button onClick={() => prevLesson && goTo(prevLesson.lesson_id)} disabled={!prevLesson}
                    className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition">
                    ← Previous
                  </button>

                  {/* Next — only enabled when all quizzes passed */}
                  <button
                    onClick={handleNext}
                    disabled={!nextLesson || !allPassed}
                    title={!allPassed ? "Answer all quiz questions correctly first" : ""}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition">
                    {allPassed ? "Next lesson →" : `🔒 ${quizzes.length - quizzes.filter((q) => qState[q.quiz_id]?.correct).length} question${quizzes.length - quizzes.filter((q) => qState[q.quiz_id]?.correct).length !== 1 ? "s" : ""} left`}
                  </button>
                </div>
              </div>

              {/* Dot nav */}
              <div className="flex items-center gap-1.5 mt-4 justify-center flex-wrap">
                {lessons.map((l) => (
                  <button key={l.lesson_id} onClick={() => goTo(l.lesson_id)} title={l.title}
                    className={`h-2 rounded-full transition-all duration-200 ${
                      l.lesson_id === currentLesson.lesson_id ? "w-5 bg-indigo-600"
                      : isDone(l.lesson_id) ? "w-2 bg-emerald-400 dark:bg-emerald-600"
                                            : "w-2 bg-slate-200 dark:bg-slate-600 hover:bg-slate-400"
                    }`}
                  />
                ))}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
