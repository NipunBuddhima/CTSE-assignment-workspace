import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight, FiTruck, FiShield, FiHeadphones,
  FiStar, FiGift, FiCheck, FiZap, FiAward, FiRefreshCw
} from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/apiService';
import { svgPlaceholderDataUrl } from '../utils/placeholder';

/* ── Category data ─────────────────────────────────────────── */
const CATEGORIES = [
  { name: 'Electronics',   emoji: '⚡', color: 'from-blue-500 to-indigo-600' },
  { name: 'Clothing',      emoji: '👗', color: 'from-pink-500 to-rose-600' },
  { name: 'Home & Garden', emoji: '🏡', color: 'from-emerald-500 to-teal-600' },
  { name: 'Sports',        emoji: '🏋️', color: 'from-orange-500 to-amber-600' },
  { name: 'Books',         emoji: '📚', color: 'from-purple-500 to-violet-600' },
  { name: 'Beauty',        emoji: '✨', color: 'from-fuchsia-500 to-pink-600' },
];

/* ── Features ────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: FiTruck,
    title: 'Lightning Fast Delivery',
    desc: 'Express delivery in 2–3 business days with live tracking at every step.',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    icon: FiShield,
    title: 'Secure & Protected',
    desc: 'Bank-grade SSL encryption protects every transaction and your personal data.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: FiHeadphones,
    title: '24 / 7 Support',
    desc: 'Our expert team is available around the clock to help with any issue.',
    color: 'from-purple-500 to-violet-500',
  },
  {
    icon: FiAward,
    title: 'Premium Quality',
    desc: 'Every product is verified by our quality team before reaching you.',
    color: 'from-amber-500 to-orange-500',
  },
];

/* ── Stats ──────────────────────────────────────────────────── */
const STATS = [
  { value: '2M+', label: 'Happy Customers' },
  { value: '50K+', label: 'Products Listed' },
  { value: '99.2%', label: 'Satisfaction rate' },
  { value: '4.9★', label: 'Average Rating' },
];

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await productService.getAllProducts({ limit: 8 });
        const data = res.data?.data;
        setFeaturedProducts(Array.isArray(data) ? data.slice(0, 8) : []);
      } catch {
        setError('Could not load featured products.');
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      {/* ════════════════════════════════ HERO ════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #312e81 70%, #1e1b4b 100%)' }} />
        {/* Animated blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full opacity-20 blur-3xl -z-10 animate-pulse"
          style={{ background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-15 blur-3xl -z-10"
          style={{ background: 'radial-gradient(circle, #f76c35 0%, transparent 70%)' }} />
        <div className="absolute top-[30%] left-[30%] w-[300px] h-[300px] rounded-full opacity-10 blur-3xl -z-10"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left content */}
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 text-indigo-300"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                <FiZap size={12} className="text-amber-400" /> Trusted by 2M+ shoppers
              </div>

              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black text-white leading-[1.05] mb-6 tracking-tight">
                Shop the{' '}
                <span
                  className="animate-gradient-x"
                  style={{
                    background: 'linear-gradient(90deg, #818cf8, #c084fc, #f472b6, #fb923c, #818cf8)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Future
                </span>
                <br />
                with ShopHub
              </h1>

              <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-lg">
                Discover thousands of premium products at unbeatable prices — delivered right to your door in 2–3 days.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <Link to="/products" className="btn-primary px-8 py-4 text-base font-bold gap-3 group">
                  Shop Now
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/about"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base text-white transition-all duration-200 hover:bg-white/10"
                  style={{ border: '1.5px solid rgba(255,255,255,0.25)' }}>
                  Learn More
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-4">
                {[
                  { icon: FiCheck, label: '100% Authentic' },
                  { icon: FiShield, label: 'Secure Payment' },
                  { icon: FiRefreshCw, label: 'Free Returns' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <Icon size={12} className="text-emerald-400" />
                    </div>
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: stats + image */}
            <div className="hidden lg:block animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="relative">
                {/* Glass card */}
                <div className="rounded-3xl p-6 shadow-2xl relative overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)' }}>
                  <img
                    src={svgPlaceholderDataUrl({ width: 500, height: 420, label: 'ShopHub Premium', sublabel: 'Discover Amazing Products' })}
                    alt="Premium Shopping"
                    className="w-full h-auto rounded-2xl"
                  />

                  {/* Floating cards */}
                  <div className="absolute top-4 -left-6 animate-float" style={{ animationDelay: '0s' }}>
                    <div className="px-4 py-3 rounded-2xl shadow-xl"
                      style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)' }}>
                      <p className="text-xs font-semibold text-slate-500">Orders this week</p>
                      <p className="text-xl font-black text-slate-900">12,540 <span className="text-emerald-500 text-sm">↑18%</span></p>
                    </div>
                  </div>
                  <div className="absolute bottom-8 -right-4 animate-float" style={{ animationDelay: '1.5s' }}>
                    <div className="px-4 py-3 rounded-2xl shadow-xl"
                      style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)' }}>
                      <p className="text-xs font-semibold text-slate-500">Customer rating</p>
                      <p className="text-xl font-black text-slate-900">4.9 <span className="text-amber-400">★</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center px-4 py-4 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-3xl font-black text-white mb-1">{s.value}</p>
                <p className="text-xs text-slate-400 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ CATEGORIES ════════════════════════════════ */}
      <section className="py-20" style={{ background: 'var(--color-bg-alt)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="badge badge-primary mb-4">Explore</span>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Find exactly what you're looking for</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat, i) => (
              <Link
                key={cat.name}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl border text-center transition-all duration-300 hover:-translate-y-2 animate-fade-up"
                style={{
                  background: 'var(--color-bg-card)',
                  borderColor: 'var(--color-border)',
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  {cat.emoji}
                </div>
                <span className="text-sm font-bold leading-tight" style={{ color: 'var(--color-text)' }}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ FEATURES ══════════════════════════════════ */}
      <section className="py-20" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="badge badge-primary mb-4">Why ShopHub</span>
            <h2 className="section-title">Built for the Best Experience</h2>
            <p className="section-subtitle">Premium service at every touchpoint</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="card p-7 text-center group hover:-translate-y-2 transition-all duration-300 animate-fade-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mx-auto mb-5 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="text-white" size={26} />
                  </div>
                  <h3 className="text-base font-bold mb-3" style={{ color: 'var(--color-text)' }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ FEATURED PRODUCTS ═════════════════════════ */}
      <section className="py-20" style={{ background: 'var(--color-bg-alt)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
            <div>
              <span className="badge badge-primary mb-3">New Arrivals</span>
              <h2 className="text-3xl font-black" style={{ color: 'var(--color-text)' }}>Featured Products</h2>
              <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>Hand-picked trending items just for you</p>
            </div>
            <Link to="/products" className="btn-secondary whitespace-nowrap">
              View All <FiArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card overflow-hidden">
                  <div className="skeleton h-60" />
                  <div className="p-4 space-y-3">
                    <div className="skeleton h-3 w-20 rounded-full" />
                    <div className="skeleton h-4 w-full rounded" />
                    <div className="skeleton h-3 w-3/4 rounded" />
                    <div className="skeleton h-9 w-full rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16 rounded-2xl border" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <p className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>{error}</p>
              <Link to="/products" className="btn-primary">Browse All Products</Link>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, i) => (
                <div key={product.productId || i} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl border" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <p className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>No products available yet</p>
              <Link to="/products" className="btn-primary">Browse All Products</Link>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════ PROMO BANNER ══════════════════════════════ */}
      <section className="py-20" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden px-10 py-16 md:py-20"
            style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 70%, #7e22ce 100%)' }}>
            {/* Decorative blobs */}
            <div className="absolute top-[-50px] right-[-50px] w-80 h-80 rounded-full opacity-20 blur-3xl"
              style={{ background: 'radial-gradient(circle, #f472b6, transparent)' }} />
            <div className="absolute bottom-[-30px] left-[-30px] w-60 h-60 rounded-full opacity-15 blur-2xl"
              style={{ background: 'radial-gradient(circle, #fb923c, transparent)' }} />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-4 text-amber-300"
                  style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)' }}>
                  <FiGift size={12} /> Limited Time Offer
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                  Get Up to <span style={{ color: '#fb923c' }}>50% Off</span><br />
                  Your Next Order
                </h2>
                <p className="text-base text-purple-200 max-w-lg leading-relaxed">
                  Explore our biggest sale of the season. Exclusive discounts on thousands of premium items — for a limited time only.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Link to="/products"
                  className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-lg text-indigo-900 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl group"
                  style={{ background: 'white' }}>
                  Shop the Sale
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ CTA ═══════════════════════════════════════ */}
      <section className="py-20" style={{ background: 'var(--color-bg-alt)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title mb-4">Ready to Start Shopping?</h2>
          <p className="text-lg mb-10" style={{ color: 'var(--color-text-muted)' }}>
            Join millions of satisfied customers and discover premium products at unbeatable prices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="btn-primary px-10 py-4 text-base font-bold">
              Explore Products <FiArrowRight />
            </Link>
            <Link to="/register" className="btn-secondary px-10 py-4 text-base font-bold">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
