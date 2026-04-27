import React, { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend, FiClock, FiMessageCircle, FiCheck } from 'react-icons/fi';

const CONTACT_INFO = [
  { icon: FiMail,     label: 'Email Us',      val: 'hello@shophub.lk',  href: 'mailto:hello@shophub.lk', color: 'from-indigo-500 to-purple-500' },
  { icon: FiPhone,    label: 'Call Us',        val: '+94 11 234 5678',   href: 'tel:+94112345678',        color: 'from-blue-500 to-cyan-500' },
  { icon: FiMapPin,   label: 'Visit Us',       val: '123 Commerce St, Colombo', href: '#',              color: 'from-emerald-500 to-teal-500' },
  { icon: FiClock,    label: 'Working Hours',  val: 'Mon–Fri, 9am–6pm',  href: '#',                       color: 'from-amber-500 to-orange-500' },
];

const FAQ = [
  { q: 'How long does delivery take?', a: 'Standard delivery takes 2–3 business days. Express delivery is available at checkout.' },
  { q: 'What is your return policy?', a: 'We offer hassle-free 30-day returns on all products. Just contact support.' },
  { q: 'Is my payment information secure?', a: 'Yes — all payments are encrypted with bank-grade SSL. We never store card details.' },
  { q: 'How do I track my order?', a: 'Once shipped, you\'ll receive a tracking link via email. You can also track in My Orders.' },
];

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSent(true);
      setLoading(false);
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 1200);
  };

  return (
    <div style={{ background: 'var(--color-bg)' }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="py-20 text-center animate-fade-up"
        style={{ background: 'var(--color-bg-alt)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="max-w-2xl mx-auto px-4">
          <span className="badge badge-primary mb-4">Get in Touch</span>
          <h1 className="section-title mb-4">We'd love to hear from you</h1>
          <p style={{ color: 'var(--color-text-muted)' }} className="text-lg">
            Have a question, feedback, or just want to say hi? Our friendly team is always ready to help.
          </p>
        </div>
      </section>

      {/* ── Contact info cards ────────────────────────────── */}
      <section className="py-14" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CONTACT_INFO.map(({ icon: Icon, label, val, href, color }, i) => (
              <a key={label} href={href}
                className="card p-5 flex items-start gap-4 group hover:-translate-y-1 transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                  <Icon size={18} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{val}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Split: Form + FAQ ─────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">

            {/* Form */}
            <div className="animate-fade-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                  <FiMessageCircle size={18} className="text-white" />
                </div>
                <h2 className="text-2xl font-black" style={{ color: 'var(--color-text)' }}>Send a Message</h2>
              </div>

              {sent ? (
                <div className="text-center py-16 card animate-scale-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                    <FiCheck size={28} className="text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-black mb-2" style={{ color: 'var(--color-text)' }}>Message Sent!</h3>
                  <p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>We'll get back to you within 24 hours.</p>
                  <button onClick={() => setSent(false)} className="btn-secondary text-sm">Send Another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Name</label>
                      <input type="text" name="name" value={form.name} onChange={handleChange}
                        required className="input-field text-sm" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Email</label>
                      <input type="email" name="email" value={form.email} onChange={handleChange}
                        required className="input-field text-sm" placeholder="you@email.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Subject</label>
                    <input type="text" name="subject" value={form.subject} onChange={handleChange}
                      required className="input-field text-sm" placeholder="How can we help?" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Message</label>
                    <textarea name="message" value={form.message} onChange={handleChange} rows={5}
                      required className="input-field text-sm resize-none"
                      placeholder="Tell us more about your inquiry…" />
                  </div>
                  <button type="submit" disabled={loading}
                    className="btn-primary w-full py-3.5 text-base font-bold gap-3">
                    {loading
                      ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Sending…</>
                      : <><FiSend size={16} /> Send Message</>
                    }
                  </button>
                </form>
              )}
            </div>

            {/* FAQ */}
            <div className="animate-fade-up" style={{ animationDelay: '150ms' }}>
              <h2 className="text-2xl font-black mb-6" style={{ color: 'var(--color-text)' }}>
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {FAQ.map((item, i) => (
                  <div key={i} className="card overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left gap-4 transition-colors"
                      style={{ background: openFaq === i ? 'rgba(99,102,241,0.06)' : 'transparent' }}>
                      <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{item.q}</span>
                      <span className={`text-xl transition-transform duration-300 flex-shrink-0 ${openFaq === i ? 'rotate-45' : ''}`}
                        style={{ color: 'var(--color-primary)' }}>+</span>
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-4 animate-slide-down">
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{item.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Additional support */}
              <div className="mt-8 p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.1), rgba(124,58,237,0.1))', border: '1px solid rgba(99,102,241,0.2)' }}>
                <p className="text-sm font-bold mb-1" style={{ color: 'var(--color-text)' }}>Need urgent help?</p>
                <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
                  Our live support team is available Monday–Friday, 9am–6pm.
                </p>
                <a href="mailto:support@shophub.lk" className="btn-primary text-sm py-2 gap-2">
                  <FiMail size={14} /> Email Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
