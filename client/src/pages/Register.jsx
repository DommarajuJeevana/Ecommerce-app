import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function passwordStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});

  const strength = useMemo(() => passwordStrength(form.password), [form.password]);
  const strengthLabel = ["Weak", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["bg-red-400", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-emerald-500"][strength];

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = "Enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address";
    if (form.phone && !/^\+?[0-9\s-]{7,15}$/.test(form.phone)) e.phone = "Enter a valid phone number";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!agreed) e.agreed = "Please accept the Terms & Privacy Policy";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      navigate("/");
    } catch {
      /* toast handled in context */
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-surface-soft px-4 py-16">
      <div className="w-full max-w-md animate-fadeUp">
        <div className="card p-8 sm:p-10">
          <div className="mb-8 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-500 text-xl font-extrabold text-white">N</span>
            <h1 className="mt-4 text-2xl font-extrabold text-ink-900">Create your account</h1>
            <p className="mt-1 text-sm text-ink-500">Join NexoraStore for exclusive deals</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-700">Full name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field pl-11" placeholder="Jane Doe" />
              </div>
              {errors.name && <p className="mt-1 text-xs font-medium text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-700">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field pl-11" placeholder="you@example.com" />
              </div>
              {errors.email && <p className="mt-1 text-xs font-medium text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-700">Phone <span className="font-normal text-ink-300">(optional)</span></label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field pl-11" placeholder="+1 555 123 4567" />
              </div>
              {errors.phone && <p className="mt-1 text-xs font-medium text-red-600">{errors.phone}</p>}
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
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex h-1.5 flex-1 gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <span key={i} className={`h-full flex-1 rounded-full ${i < strength ? strengthColor : "bg-surface-border"}`} />
                    ))}
                  </div>
                  <span className="text-[11px] font-medium text-ink-500">{strengthLabel}</span>
                </div>
              )}
              {errors.password && <p className="mt-1 text-xs font-medium text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-700">Confirm password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="input-field pl-11"
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs font-medium text-red-600">{errors.confirmPassword}</p>}
            </div>

            <label className="flex items-start gap-2 text-xs text-ink-500">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-surface-border text-brand-500 focus:ring-brand-200" />
              I agree to the <Link to="/terms" className="font-semibold text-brand-600 hover:underline">Terms</Link> and{" "}
              <Link to="/privacy" className="font-semibold text-brand-600 hover:underline">Privacy Policy</Link>
            </label>
            {errors.agreed && <p className="-mt-2 text-xs font-medium text-red-600">{errors.agreed}</p>}

            <button type="submit" disabled={loading} className="btn-primary mt-2 w-full">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-brand-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
