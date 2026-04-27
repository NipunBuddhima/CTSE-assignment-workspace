import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut,
  FiPackage, FiChevronDown, FiSun, FiMoon, FiSearch, FiHeart
} from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout, getCartItemCount, cart, darkMode, toggleDarkMode } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const navItems = [
    { label: 'Products', href: '/products' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const cartCount = getCartItemCount();

  const isActive = (href) => location.pathname === href;

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'shadow-nav'
            : ''
        }`}
        style={{
          background: 'var(--nav-bg)',
          borderBottom: '1px solid var(--nav-border)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        {/* Accent line */}
        <div className="accent-bar" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ───────────────────────────────── */}
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', boxShadow: '0 4px 14px rgba(79,70,229,0.4)' }}>
                <span className="text-white font-black text-lg leading-none select-none">S</span>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-accent-500 rounded-full border-2 border-white dark:border-gray-900" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight" style={{ color: 'var(--color-text)' }}>
                  Shop<span className="text-gradient">Hub</span>
                </span>
                <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>
                  Premium Store
                </p>
              </div>
            </Link>

            {/* ── Desktop Nav ────────────────────────── */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 relative ${
                    isActive(item.href)
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  style={{ color: isActive(item.href) ? undefined : 'var(--color-text-muted)' }}
                >
                  {item.label}
                  {isActive(item.href) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-indigo-500" />
                  )}
                </Link>
              ))}
            </nav>

            {/* ── Right Actions ─────────────────────── */}
            <div className="flex items-center gap-1.5">

              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 group"
                aria-label="Toggle dark mode"
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? (
                  <FiSun className="text-amber-400 group-hover:rotate-45 transition-transform duration-300" size={18} />
                ) : (
                  <FiMoon className="text-gray-500 group-hover:-rotate-12 transition-transform duration-300" size={18} />
                )}
              </button>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2.5 rounded-xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 group"
                title="Shopping Cart"
              >
                <FiShoppingCart
                  size={20}
                  className="transition-transform duration-300 group-hover:scale-110"
                  style={{ color: 'var(--color-text-muted)' }}
                />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black text-white flex items-center justify-center animate-scale-in"
                    style={{ background: 'linear-gradient(135deg, #f76c35, #e11d48)' }}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User menu (desktop) */}
              {isAuthenticated ? (
                <div className="hidden md:block relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                      {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:block text-sm font-semibold max-w-[100px] truncate" style={{ color: 'var(--color-text)' }}>
                      {user?.firstName}
                    </span>
                    <FiChevronDown
                      size={14}
                      className={`transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                      style={{ color: 'var(--color-text-muted)' }}
                    />
                  </button>

                  {/* Dropdown */}
                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl overflow-hidden animate-slide-down z-50"
                      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
                    >
                      {/* User info */}
                      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                        <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Signed in as</p>
                        <p className="text-sm font-bold truncate" style={{ color: 'var(--color-text)' }}>
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--color-text-faint)' }}>{user?.email}</p>
                      </div>
                      <div className="p-1.5">
                        <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                          style={{ color: 'var(--color-text)' }}>
                          <FiUser size={16} className="text-indigo-500" /> My Profile
                        </Link>
                        <Link to="/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                          style={{ color: 'var(--color-text)' }}>
                          <FiPackage size={16} className="text-purple-500" /> My Orders
                        </Link>
                        <button onClick={() => { logout(); navigate('/'); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-1"
                          style={{ borderTop: '1px solid var(--color-border)' }}>
                          <FiLogOut size={16} /> Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/login" className="btn-ghost text-sm font-semibold">Log In</Link>
                  <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2.5 rounded-xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                {isMenuOpen
                  ? <FiX size={20} style={{ color: 'var(--color-text)' }} />
                  : <FiMenu size={20} style={{ color: 'var(--color-text)' }} />
                }
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ──────────────────────────────── */}
      {/* Backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed inset-y-0 right-0 w-[80vw] max-w-sm z-50 md:hidden flex flex-col transition-transform duration-300 ease-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: 'var(--color-bg-card)', borderLeft: '1px solid var(--color-border)' }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <span className="font-black text-lg" style={{ color: 'var(--color-text)' }}>Menu</span>
          <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <FiX size={20} style={{ color: 'var(--color-text)' }} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive(item.href) ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : ''
              }`}
              style={{ color: isActive(item.href) ? undefined : 'var(--color-text)' }}
            >
              {item.label}
            </Link>
          ))}

          <div className="pt-2" style={{ borderTop: '1px solid var(--color-border)', marginTop: '8px' }}>
            {isAuthenticated ? (
              <>
                {/* User info */}
                <div className="flex items-center gap-3 px-4 py-3 mb-1">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                    {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--color-text)' }}>{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{user?.email}</p>
                  </div>
                </div>
                <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                  style={{ color: 'var(--color-text)' }}>
                  <FiUser size={16} className="text-indigo-500" /> My Profile
                </Link>
                <Link to="/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                  style={{ color: 'var(--color-text)' }}>
                  <FiPackage size={16} className="text-purple-500" /> My Orders
                </Link>
                <button onClick={() => { logout(); navigate('/'); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <FiLogOut size={16} /> Log Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link to="/login" className="btn-secondary w-full text-center justify-center">Log In</Link>
                <Link to="/register" className="btn-primary w-full text-center justify-center">Create Account</Link>
              </div>
            )}
          </div>

          {/* Dark mode in mobile */}
          <div className="pt-4 mt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
            <button onClick={toggleDarkMode}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              style={{ color: 'var(--color-text)' }}>
              {darkMode ? <FiSun size={16} className="text-amber-400" /> : <FiMoon size={16} className="text-indigo-400" />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Header;
