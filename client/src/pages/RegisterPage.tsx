import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../services/api";

export default function RegisterPage() {
  const [form, setForm]         = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const navigate = useNavigate();
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError("");
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      await authApi.register({ name: form.name, email: form.email, password: form.password, role: "USER" });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  const inp = "w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition";
  const lbl = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-8">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm">🎓</div>
            <span className="font-semibold text-gray-900 dark:text-white">LearnHub</span>
          </div>

          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Create account</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-7">Join LearnHub as a student</p>

          {success ? (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="font-semibold text-emerald-800 dark:text-emerald-400 text-sm">Account created!</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">Redirecting to login…</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className={lbl}>Full name</label>
                <input type="text" value={form.name} onChange={e => set("name", e.target.value)}
                  placeholder="John Doe" required className={inp} />
              </div>
              <div>
                <label className={lbl}>Email address</label>
                <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                  placeholder="you@example.com" required className={inp} />
              </div>
              <div>
                <label className={lbl}>Password</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} value={form.password}
                    onChange={e => set("password", e.target.value)}
                    placeholder="Min. 6 characters" required className={inp + " pr-10"} />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
              <div>
                <label className={lbl}>Confirm password</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} value={form.confirm}
                    onChange={e => set("confirm", e.target.value)}
                    placeholder="Re-enter password" required
                    className={inp + " pr-10 " + (form.confirm && form.confirm !== form.password ? "border-red-400 dark:border-red-500" : "")} />
                  {form.confirm && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                      {form.confirm === form.password ? "✅" : "❌"}
                    </span>
                  )}
                </div>
              </div>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium text-sm rounded-lg transition flex items-center justify-center gap-2">
                {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
