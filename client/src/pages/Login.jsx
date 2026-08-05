import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const { login, forgotPassword, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const validate = () => {
    const e = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await login(form.email, form.password, remember);
      navigate(from, { replace: true });
    } catch {
      /* toast handled in context */
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(resetEmail)) {
      toast.error("Enter a valid email address");
      return;
    }
    await forgotPassword(resetEmail);
    setShowForgot(false);
    setResetEmail("");
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-surface-soft px-4 py-16">
      <div className="w-full max-w-md animate-fadeUp">
        <div className="card p-8 sm:p-10">
          <div className="mb-8 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-500 text-xl font-extrabold text-white">N</span>
            <h1 className="mt-4 text-2xl font-extrabold text-ink-900">Welcome back</h1>
            <p className="mt-1 text-sm text-ink-500">Sign in to continue to NexoraStore</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-700">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-11"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs font-medium text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-700">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-11 pr-11"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-700" aria-label="Toggle password visibility">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs font-medium text-red-600">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-ink-700">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-surface-border text-brand-500 focus:ring-brand-200" />
                Remember me
              </label>
              <button type="button" onClick={() => setShowForgot(true)} className="font-semibold text-brand-600 hover:underline">
                Forgot password?
              </button>
            </div>

            <button type="submit" disabled={loading} className="btn-primary mt-2 w-full">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-brand-600 hover:underline">Create one</Link>
          </p>
        </div>
      </div>

      {showForgot && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
          <div className="w-full max-w-sm animate-fadeUp rounded-2xl bg-white p-6 shadow-pop">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-ink-900">Reset your password</h3>
              <button onClick={() => setShowForgot(false)} className="rounded-full p-1.5 hover:bg-surface-soft" aria-label="Close"><X size={18} /></button>
            </div>
            <p className="mb-4 text-sm text-ink-500">Enter your email and we'll send you a reset link.</p>
            <form onSubmit={handleForgot} className="flex flex-col gap-3">
              <input type="email" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="you@example.com" className="input-field" />
              <button type="submit" className="btn-primary w-full">Send reset link</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
