import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiArrowRight, FiCheck } from 'react-icons/fi';
import { authService } from '../services/apiService';
import { useAppContext } from '../context/AppContext';

const PERKS = [
  { emoji: '🎁', title: 'Exclusive Deals', desc: 'Member-only discounts and early access' },
  { emoji: '🚚', title: 'Free Shipping', desc: 'On orders over $50 — always' },
  { emoji: '↩️', title: 'Easy Returns', desc: '30-day hassle-free return policy' },
  { emoji: '🔔', title: 'Order Updates', desc: 'Live tracking and status alerts' },
];

const getStrength = (pw) => {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

const Register = () => {
  const navigate = useNavigate();
  const { showNotification } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const pwStrength = getStrength(formData.password);

  const validate = () => {
    const e = {};
    if (!formData.firstName.trim()) e.firstName = 'First name is required';
    if (!formData.lastName.trim()) e.lastName = 'Last name is required';
    if (!formData.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email format';
    if (!formData.password) e.password = 'Password is required';
    else if (formData.password.length < 6) e.password = 'Minimum 6 characters';
    if (!formData.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
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
      const res = await authService.register({
        firstName: formData.firstName, lastName: formData.lastName,
        email: formData.email, password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      if (res.data?.success) {
        showNotification('Account created! Please sign in.', 'success');
        navigate('/login');
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg)' }}>

      {/* ── Left panel: Form ────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 animate-fade-up order-2 lg:order-1">
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
            <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--color-text)' }}>Create Account</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-500 font-semibold hover:text-indigo-400 transition-colors">Sign in</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text)' }}>First Name</label>
                <div className="relative">
                  <FiUser size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-faint)' }} />
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                    className="input-field pl-9 text-sm" placeholder="John" autoComplete="given-name" />
                </div>
                {errors.firstName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text)' }}>Last Name</label>
                <div className="relative">
                  <FiUser size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-faint)' }} />
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                    className="input-field pl-9 text-sm" placeholder="Doe" autoComplete="family-name" />
                </div>
                {errors.lastName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text)' }}>Email Address</label>
              <div className="relative">
                <FiMail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-faint)' }} />
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  className="input-field pl-9 text-sm" placeholder="you@example.com" autoComplete="email" />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text)' }}>Password</label>
              <div className="relative">
                <FiLock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-faint)' }} />
                <input type={showPw ? 'text' : 'password'} name="password" value={formData.password}
                  onChange={handleChange} className="input-field pl-9 pr-10 text-sm"
                  placeholder="Min. 6 characters" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors hover:text-indigo-500"
                  style={{ color: 'var(--color-text-faint)' }}>
                  {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
              {/* Strength bar */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{ background: i < pwStrength ? strengthColor[pwStrength] : 'var(--color-border)' }} />
                    ))}
                  </div>
                  <p className="text-xs font-semibold" style={{ color: strengthColor[pwStrength] }}>
                    {strengthLabel[pwStrength]}
                  </p>
                </div>
              )}
              {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text)' }}>Confirm Password</label>
              <div className="relative">
                <FiLock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-faint)' }} />
                <input type={showCpw ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword}
                  onChange={handleChange} className="input-field pl-9 pr-10 text-sm"
                  placeholder="Repeat password" autoComplete="new-password" />
                <button type="button" onClick={() => setShowCpw(!showCpw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors hover:text-indigo-500"
                  style={{ color: 'var(--color-text-faint)' }}>
                  {showCpw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <FiCheck size={15} className="absolute right-10 top-1/2 -translate-y-1/2 text-emerald-500" />
                )}
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword}</p>}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 text-sm cursor-pointer">
              <input type="checkbox" required className="mt-0.5 rounded" />
              <span style={{ color: 'var(--color-text-muted)' }}>
                I agree to the{' '}
                <a href="#" className="text-indigo-500 font-semibold hover:underline">Terms of Service</a>{' '}and{' '}
                <a href="#" className="text-indigo-500 font-semibold hover:underline">Privacy Policy</a>
              </span>
            </label>

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base font-bold gap-3 mt-2">
              {loading
                ? <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Creating account…</span>
                : <><FiArrowRight size={18} /> Create Account</>
              }
            </button>
          </form>
        </div>
      </div>

      {/* ── Right panel: Branding ────────────── */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between relative overflow-hidden order-1 lg:order-2"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)' }}>
        <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
        <div className="absolute bottom-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #f472b6, transparent)' }} />

        <div className="relative z-10 p-12 flex-1 flex flex-col justify-center">
          <Link to="/" className="flex items-center gap-2.5 mb-14 w-fit">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              <span className="text-white font-black text-xl">S</span>
            </div>
            <span className="text-white text-xl font-black">ShopHub</span>
          </Link>

          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Join 2M+ shoppers<br />
            <span style={{ color: '#a78bfa' }}>already loving us</span>
          </h2>
          <p className="text-slate-300 mb-10 leading-relaxed max-w-sm">
            Create your free account and start enjoying exclusive member benefits today.
          </p>

          <div className="space-y-3">
            {PERKS.map((p) => (
              <div key={p.title} className="flex items-center gap-4 px-4 py-3 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span className="text-2xl">{p.emoji}</span>
                <div>
                  <p className="text-sm font-bold text-white">{p.title}</p>
                  <p className="text-xs text-slate-400">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 p-12 text-slate-500 text-xs">
          © {new Date().getFullYear()} ShopHub. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Register;
