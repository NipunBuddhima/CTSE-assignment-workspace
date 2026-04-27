import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { authService } from '../services/apiService';
import { useAppContext } from '../context/AppContext';

const FEATURES = [
  { emoji: '📦', text: '50K+ Premium Products' },
  { emoji: '🚀', text: '2-3 Day Express Delivery' },
  { emoji: '🔒', text: 'Bank-Grade Security' },
  { emoji: '💬', text: '24/7 Customer Support' },
];

const Login = () => {
  const navigate = useNavigate();
  const { login, showNotification } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!formData.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email format';
    if (!formData.password) e.password = 'Password is required';
    else if (formData.password.length < 6) e.password = 'Minimum 6 characters';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      setLoading(true);
      const res = await authService.login(formData.email, formData.password);
      if (res.data?.success) {
        const { token, ...userData } = res.data.data;
        login(userData, token);
        navigate('/');
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Login failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg)' }}>

      {/* ── Left panel: Branding ─────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 45%, #312e81 100%)' }}>
        {/* Animated blobs */}
        <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />
        <div className="absolute bottom-[-80px] left-[-60px] w-[350px] h-[350px] rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #f76c35, transparent)' }} />

        <div className="relative z-10 p-12 flex-1 flex flex-col justify-center">
          <Link to="/" className="flex items-center gap-2.5 mb-14 group w-fit">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              <span className="text-white font-black text-xl">S</span>
            </div>
            <span className="text-white text-xl font-black">ShopHub</span>
          </Link>

          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Welcome back to<br />
            <span style={{ color: '#818cf8' }}>ShopHub</span>
          </h2>
          <p className="text-slate-300 mb-12 text-lg leading-relaxed max-w-sm">
            Sign in to access your orders, wishlist, and exclusive member deals.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f) => (
              <div key={f.text} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span className="text-xl">{f.emoji}</span>
                <span className="text-sm text-slate-300 font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 p-12 text-slate-500 text-xs">
          © {new Date().getFullYear()} ShopHub. All rights reserved.
        </div>
      </div>

      {/* ── Right panel: Form ────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 animate-fade-up">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              <span className="text-white font-black text-base">S</span>
            </div>
            <span className="font-black text-xl" style={{ color: 'var(--color-text)' }}>ShopHub</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--color-text)' }}>Sign In</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-500 font-semibold hover:text-indigo-400 transition-colors">
                Create one free
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                Email Address
              </label>
              <div className="relative">
                <FiMail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-text-faint)' }} />
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  className="input-field pl-10" placeholder="you@example.com" autoComplete="email" />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                Password
              </label>
              <div className="relative">
                <FiLock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-text-faint)' }} />
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                  onChange={handleChange} className="input-field pl-10 pr-11"
                  placeholder="Enter your password" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors hover:text-indigo-500"
                  style={{ color: 'var(--color-text-faint)' }}>
                  {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password}</p>}
            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span style={{ color: 'var(--color-text-muted)' }}>Remember me</span>
              </label>
              <a href="#" className="text-indigo-500 font-semibold hover:text-indigo-400 transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3.5 text-base font-bold gap-3">
              {loading
                ? <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Signing in…</span>
                : <><FiArrowRight size={18} /> Sign In</>
              }
            </button>
          </form>

          <p className="text-center mt-8 text-xs" style={{ color: 'var(--color-text-faint)' }}>
            By signing in, you agree to our{' '}
            <a href="#" className="text-indigo-500 hover:underline">Terms of Service</a>{' '}and{' '}
            <a href="#" className="text-indigo-500 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
