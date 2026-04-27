import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShield, FiTruck, FiAward, FiUsers, FiHeart, FiStar } from 'react-icons/fi';

const STATS = [
  { value: '2M+', label: 'Happy Customers', icon: FiUsers },
  { value: '50K+', label: 'Products Listed',  icon: FiAward },
  { value: '4.9★', label: 'Avg Rating',       icon: FiStar },
  { value: '99%', label: 'Satisfaction',       icon: FiHeart },
];

const VALUES = [
  { icon: FiShield, title: 'Trust & Safety',  desc: 'Every transaction is protected with bank-grade SSL encryption. Your data never leaves our secure servers.',       color: 'from-blue-500 to-indigo-600' },
  { icon: FiTruck,  title: 'Fast Delivery',   desc: 'We partner with top logistics providers to ensure your orders arrive in 2–3 business days, every time.', color: 'from-emerald-500 to-teal-600' },
  { icon: FiAward,  title: 'Premium Quality', desc: 'Our team manually vets every seller and product to ensure authenticity and high quality standards.',          color: 'from-amber-500 to-orange-600' },
  { icon: FiHeart,  title: 'Customer First',  desc: '24/7 support, easy returns, and a hassle-free shopping experience — because you deserve the best.',          color: 'from-pink-500 to-rose-600' },
];

const TEAM = [
  { name: 'Amara Silva', role: 'CEO & Founder',     bg: 'from-indigo-500 to-purple-600',  initials: 'AS' },
  { name: 'Ben Perera',  role: 'CTO',               bg: 'from-blue-500 to-cyan-600',      initials: 'BP' },
  { name: 'Chara Wicks', role: 'Head of Marketing', bg: 'from-pink-500 to-rose-600',      initials: 'CW' },
  { name: 'Dev Raj',     role: 'Head of Operations',bg: 'from-amber-500 to-orange-600',   initials: 'DR' },
];

const About = () => (
  <div style={{ background: 'var(--color-bg)' }}>

    {/* ── Hero ──────────────────────────────────────── */}
    <section className="relative py-24 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)' }}>
      <div className="absolute top-[-80px] right-[-80px] w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />
      <div className="absolute bottom-[-60px] left-[-60px] w-72 h-72 rounded-full opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(circle, #f472b6, transparent)' }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-fade-up">
        <span className="badge text-indigo-300 mb-6 text-xs"
          style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
          Our Story
        </span>
        <h1 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
          Shopping,{' '}
          <span style={{
            background: 'linear-gradient(90deg, #818cf8, #c084fc, #f472b6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>reimagined</span>
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          ShopHub was founded with one simple mission: to make premium shopping accessible to everyone,
          anywhere in the world — with complete trust, transparency, and joy.
        </p>
      </div>
    </section>

    {/* ── Stats ─────────────────────────────────────── */}
    <section className="py-16" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, label, icon: Icon }, i) => (
            <div key={label} className="text-center animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(99,102,241,0.1)' }}>
                <Icon size={20} className="text-indigo-500" />
              </div>
              <p className="text-4xl font-black mb-1" style={{ color: 'var(--color-text)' }}>{value}</p>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Mission ───────────────────────────────────── */}
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-up">
            <span className="badge badge-primary mb-4">Our Mission</span>
            <h2 className="section-title mb-6">Built for real people who love great products</h2>
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--color-text-muted)' }}>
              We started ShopHub because we believed online shopping could be better — less confusing, more trustworthy,
              and genuinely enjoyable. Since 2020, we've grown into a platform trusted by over 2 million shoppers.
            </p>
            <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--color-text-muted)' }}>
              We vet every seller, verify every product, and stand behind every order. When something goes wrong,
              we make it right — no questions asked.
            </p>
            <Link to="/products" className="btn-primary gap-3">
              Shop Now <FiArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: '150ms' }}>
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="card p-5 group hover:-translate-y-1 transition-all duration-300"
                  style={{ animationDelay: `${i * 80}ms` }}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${v.color} flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="text-white" size={18} />
                  </div>
                  <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--color-text)' }}>{v.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>

    {/* ── Team ──────────────────────────────────────── */}
    <section className="py-20" style={{ background: 'var(--color-bg-alt)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 animate-fade-up">
          <span className="badge badge-primary mb-4">The Team</span>
          <h2 className="section-title">Meet the people behind ShopHub</h2>
          <p className="section-subtitle">Passionate about making shopping better for everyone</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {TEAM.map((member, i) => (
            <div key={member.name} className="card p-5 text-center group hover:-translate-y-2 transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}>
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${member.bg} flex items-center justify-center text-white text-xl font-black mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {member.initials}
              </div>
              <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>{member.name}</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── CTA ───────────────────────────────────────── */}
    <section className="py-20" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-up">
        <h2 className="section-title mb-4">Ready to Shop with Confidence?</h2>
        <p className="section-subtitle mb-10">Join millions of happy shoppers. Free to join, no hidden fees.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/products" className="btn-primary px-10 py-4 text-base font-bold">Explore Products <FiArrowRight /></Link>
          <Link to="/contact" className="btn-secondary px-10 py-4 text-base font-bold">Talk to Us</Link>
        </div>
      </div>
    </section>
  </div>
);

export default About;
