import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiEdit2, FiSave, FiX, FiKey, FiUser, FiMail,
  FiPhone, FiMapPin, FiPackage, FiShield, FiLogOut, FiEye, FiEyeOff
} from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';
import { authService } from '../services/apiService';

const NAV_ITEMS = [
  { id: 'profile',  label: 'Personal Info', icon: FiUser },
  { id: 'orders',   label: 'My Orders',     icon: FiPackage },
  { id: 'security', label: 'Security',       icon: FiShield },
];

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser, isAuthenticated, showNotification, logout } = useAppContext();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const [showPw, setShowPw] = useState({ cur: false, new: false, con: false });

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    postalCode: user?.address?.postalCode || '',
    country: user?.address?.country || '',
  });

  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  if (!isAuthenticated) { navigate('/login'); return null; }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await authService.updateProfile(formData);
      if (res.data?.success) {
        updateUser(res.data.data);
        setIsEditing(false);
        showNotification('Profile updated successfully!', 'success');
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePw = async () => {
    if (pwData.newPassword !== pwData.confirmPassword) {
      showNotification('Passwords do not match', 'error'); return;
    }
    try {
      setLoading(true);
      const res = await authService.changePassword(pwData.currentPassword, pwData.newPassword, pwData.confirmPassword);
      if (res.data?.success) {
        setShowPwModal(false);
        setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        showNotification('Password changed successfully!', 'success');
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const avatarBg = 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)';
  const initials = `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`.toUpperCase();

  return (
    <div className="min-h-screen py-10" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header card */}
        <div className="card p-6 mb-6 animate-fade-up" style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)',
          border: 'none',
        }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-black flex-shrink-0 shadow-xl"
              style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.2)' }}>
              {initials || <FiUser size={32} />}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-black text-white">{user?.firstName} {user?.lastName}</h1>
              <p className="text-indigo-200 text-sm">{user?.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {user?.isEmailVerified && (
                  <span className="badge text-emerald-300 text-[10px] px-2 py-0.5"
                    style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                    ✓ Email Verified
                  </span>
                )}
                <span className="badge text-indigo-200 text-[10px] px-2 py-0.5"
                  style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)' }}>
                  Member
                </span>
              </div>
            </div>
            <button onClick={() => { logout(); navigate('/'); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/20"
              style={{ border: '1px solid rgba(239,68,68,0.3)' }}>
              <FiLogOut size={15} /> Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar nav */}
          <div className="md:col-span-1">
            <nav className="card p-2 space-y-1 animate-fade-up">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => { setActiveTab(id); if (id === 'orders') navigate('/orders'); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                    activeTab === id ? 'text-indigo-600 dark:text-indigo-400' : ''
                  }`}
                  style={activeTab === id
                    ? { background: 'rgba(99,102,241,0.1)' }
                    : { color: 'var(--color-text-muted)' }}>
                  <Icon size={16} className={activeTab === id ? 'text-indigo-500' : ''} />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main content */}
          <div className="md:col-span-3 animate-fade-up" style={{ animationDelay: '80ms' }}>

            {/* ── Personal Info Tab ────────── */}
            {activeTab === 'profile' && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6 pb-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <h2 className="text-lg font-black" style={{ color: 'var(--color-text)' }}>Personal Information</h2>
                  {!isEditing
                    ? <button onClick={() => setIsEditing(true)} className="btn-secondary text-sm py-2 gap-2"><FiEdit2 size={14} /> Edit</button>
                    : <div className="flex gap-2">
                        <button onClick={handleSave} disabled={loading} className="btn-primary text-sm py-2 gap-2"><FiSave size={14} /> Save</button>
                        <button onClick={() => setIsEditing(false)} className="btn-secondary text-sm py-2 gap-1"><FiX size={14} /></button>
                      </div>
                  }
                </div>

                {isEditing ? (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      {[['firstName','First Name'],['lastName','Last Name']].map(([name, lbl]) => (
                        <div key={name}>
                          <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--color-text-muted)' }}>{lbl}</label>
                          <input type="text" name={name} value={formData[name]} onChange={handleChange} className="input-field text-sm" />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Email</label>
                      <input type="email" name="email" value={formData.email} disabled className="input-field text-sm opacity-60 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Phone</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field text-sm" placeholder="+1 234 567 890" />
                    </div>
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
                      <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--color-text)' }}>Shipping Address</h3>
                      <div className="space-y-3">
                        <input type="text" name="street" value={formData.street} onChange={handleChange} className="input-field text-sm" placeholder="Street Address" />
                        <div className="grid grid-cols-2 gap-3">
                          <input type="text" name="city" value={formData.city} onChange={handleChange} className="input-field text-sm" placeholder="City" />
                          <input type="text" name="state" value={formData.state} onChange={handleChange} className="input-field text-sm" placeholder="State" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} className="input-field text-sm" placeholder="Postal Code" />
                          <input type="text" name="country" value={formData.country} onChange={handleChange} className="input-field text-sm" placeholder="Country" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[
                      { icon: FiUser, label: 'Full Name', val: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Not set' },
                      { icon: FiMail, label: 'Email', val: user?.email || 'Not set' },
                      { icon: FiPhone, label: 'Phone', val: user?.phone || 'Not provided' },
                      { icon: FiMapPin, label: 'Address', val: user?.address
                        ? `${user.address.street || ''}, ${user.address.city || ''}, ${user.address.country || ''}`.replace(/^,\s*|,\s*,/g, '').trim() || 'Not provided'
                        : 'Not provided' },
                    ].map(({ icon: Icon, label, val }) => (
                      <div key={label} className="flex items-start gap-4 p-4 rounded-xl" style={{ background: 'var(--color-surface)' }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(99,102,241,0.1)' }}>
                          <Icon size={16} className="text-indigo-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--color-text-faint)' }}>{label}</p>
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{val}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Security Tab ─────────────── */}
            {activeTab === 'security' && (
              <div className="card p-6">
                <h2 className="text-lg font-black mb-6 pb-5" style={{ color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)' }}>
                  Security Settings
                </h2>
                <div className="flex items-center justify-between p-5 rounded-2xl" style={{ background: 'var(--color-surface)' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)' }}>
                      <FiKey size={20} className="text-indigo-500" />
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>Password</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Update your account password</p>
                    </div>
                  </div>
                  <button onClick={() => setShowPwModal(true)} className="btn-secondary text-sm py-2">Change</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-3xl p-6 animate-scale-in"
            style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black" style={{ color: 'var(--color-text)' }}>Change Password</h2>
              <button onClick={() => setShowPwModal(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                <FiX size={18} style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              {[
                { key: 'currentPassword', label: 'Current Password', show: showPw.cur, toggle: () => setShowPw(p => ({ ...p, cur: !p.cur })) },
                { key: 'newPassword', label: 'New Password', show: showPw.new, toggle: () => setShowPw(p => ({ ...p, new: !p.new })) },
                { key: 'confirmPassword', label: 'Confirm New Password', show: showPw.con, toggle: () => setShowPw(p => ({ ...p, con: !p.con })) },
              ].map(({ key, label, show, toggle }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text)' }}>{label}</label>
                  <div className="relative">
                    <FiKey size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-faint)' }} />
                    <input type={show ? 'text' : 'password'} value={pwData[key]}
                      onChange={(e) => setPwData(p => ({ ...p, [key]: e.target.value }))}
                      className="input-field pl-9 pr-10 text-sm" placeholder="••••••••" />
                    <button type="button" onClick={toggle}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-faint)' }}>
                      {show ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={handleChangePw} disabled={loading} className="btn-primary flex-1 py-3 font-bold">
                {loading ? 'Updating…' : 'Update Password'}
              </button>
              <button onClick={() => setShowPwModal(false)} className="btn-secondary flex-1 py-3 font-bold">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
