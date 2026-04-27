import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Notification from './components/Notification';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import About from './pages/About';
import Contact from './pages/Contact';
import './index.css';
import './App.css';

/* ── Protected route wrapper ───────────────────────────────── */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAppContext();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/* ── Auth route (redirect if logged in) ────────────────────── */
const AuthRoute = ({ children }) => {
  const { isAuthenticated } = useAppContext();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

/* ── Full-screen layout (Login / Register) ─────────────────── */
const FullScreenLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    {children}
  </div>
);

/* ── Standard layout with Header + Footer ──────────────────── */
const StandardLayout = ({ children }) => (
  <>
    <Header />
    <main className="flex-1 min-h-screen">{children}</main>
    <Footer />
  </>
);

/* ── App shell ─────────────────────────────────────────────── */
const AppShell = () => (
  <div className="flex flex-col min-h-screen transition-colors duration-300">
    <Routes>
      {/* Auth pages — no header/footer */}
      <Route path="/login"    element={<AuthRoute><FullScreenLayout><Login /></FullScreenLayout></AuthRoute>} />
      <Route path="/register" element={<AuthRoute><FullScreenLayout><Register /></FullScreenLayout></AuthRoute>} />

      {/* Standard pages */}
      <Route path="/" element={<StandardLayout><Home /></StandardLayout>} />
      <Route path="/products" element={<StandardLayout><Products /></StandardLayout>} />
      <Route path="/product/:productId" element={<StandardLayout><ProductDetail /></StandardLayout>} />
      <Route path="/cart" element={<StandardLayout><Cart /></StandardLayout>} />
      <Route path="/about" element={<StandardLayout><About /></StandardLayout>} />
      <Route path="/contact" element={<StandardLayout><Contact /></StandardLayout>} />

      {/* Protected pages */}
      <Route path="/checkout" element={<StandardLayout><ProtectedRoute><Checkout /></ProtectedRoute></StandardLayout>} />
      <Route path="/profile"  element={<StandardLayout><ProtectedRoute><Profile /></ProtectedRoute></StandardLayout>} />
      <Route path="/orders"   element={<StandardLayout><ProtectedRoute><Orders /></ProtectedRoute></StandardLayout>} />

      {/* 404 fallback */}
      <Route path="*" element={<StandardLayout><NotFound /></StandardLayout>} />
    </Routes>

    {/* Global notification toast */}
    <Notification />
  </div>
);

/* ── 404 page ──────────────────────────────────────────────── */
const NotFound = () => (
  <div className="min-h-[70vh] flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
    <div className="text-center max-w-md mx-auto px-6 animate-fade-up">
      <div className="text-[7rem] font-black mb-4 leading-none"
        style={{
          background: 'linear-gradient(135deg,#4f46e5,#7c3aed,#a855f7)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
        404
      </div>
      <h1 className="text-2xl font-black mb-3" style={{ color: 'var(--color-text)' }}>Page not found</h1>
      <p className="mb-8" style={{ color: 'var(--color-text-muted)' }}>
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href="/" className="btn-primary px-8 py-3 font-bold">Go Home</a>
        <a href="/products" className="btn-secondary px-8 py-3 font-bold">Browse Products</a>
      </div>
    </div>
  </div>
);

/* ── Root ──────────────────────────────────────────────────── */
const App = () => (
  <Router>
    <AppProvider>
      <AppShell />
    </AppProvider>
  </Router>
);

export default App;
