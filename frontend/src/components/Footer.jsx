import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiFacebook, FiTwitter, FiInstagram, FiLinkedin,
  FiMail, FiPhone, FiMapPin, FiArrowRight, FiHeart
} from 'react-icons/fi';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const footerLinks = {
    shop: [
      { label: 'Electronics', href: '/products?category=Electronics' },
      { label: 'Clothing', href: '/products?category=Clothing' },
      { label: 'Home & Garden', href: '/products?category=Home+%26+Garden' },
      { label: 'Sports', href: '/products?category=Sports' },
      { label: 'Books', href: '/products?category=Books' },
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: '#' },
      { label: 'Press', href: '#' },
    ],
    support: [
      { label: 'FAQ', href: '#' },
      { label: 'Shipping Info', href: '#' },
      { label: 'Returns & Exchange', href: '#' },
      { label: 'Order Tracking', href: '/orders' },
      { label: 'Customer Support', href: '/contact' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
      { label: 'Refund Policy', href: '#' },
    ],
  };

  const socialLinks = [
    { icon: FiFacebook, href: '#', label: 'Facebook', color: '#1877f2' },
    { icon: FiTwitter, href: '#', label: 'Twitter', color: '#1da1f2' },
    { icon: FiInstagram, href: '#', label: 'Instagram', color: '#e1306c' },
    { icon: FiLinkedin, href: '#', label: 'LinkedIn', color: '#0a66c2' },
  ];

  const paymentMethods = ['Visa', 'Mastercard', 'PayPal', 'Apple Pay', 'Google Pay', 'Amex'];

  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8', borderTop: '1px solid #1e293b' }}>
      {/* Top gradient accent */}
      <div className="accent-bar" />

      {/* Newsletter Section */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #1e293b 100%)', borderBottom: '1px solid #1e293b' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-white mb-2">Stay in the loop</h3>
              <p className="text-slate-400 text-sm max-w-sm">
                Get exclusive deals, early access to new arrivals, and personalized offers — straight to your inbox.
              </p>
            </div>
            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 md:w-72 px-4 py-3 rounded-xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.1)' }}
                />
                <button type="submit" className="btn-primary whitespace-nowrap flex-shrink-0">
                  Subscribe <FiArrowRight size={16} />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-900/30 border border-emerald-700/40 text-emerald-400 font-semibold text-sm animate-fade-in">
                <span>🎉</span> You're subscribed! Thanks for joining.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
                <span className="text-white font-black text-base">S</span>
              </div>
              <div>
                <span className="text-lg font-black text-white">Shop</span>
                <span className="text-lg font-black" style={{ color: '#818cf8' }}>Hub</span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-xs">
              Your premier destination for quality products at unbeatable prices. Trusted by over 2 million shoppers worldwide.
            </p>

            {/* Social links */}
            <div className="flex gap-2 mb-6">
              {socialLinks.map((s) => {
                const Icon = s.icon;
                return (
                  <a key={s.label} href={s.href} aria-label={s.label} title={s.label}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = s.color; e.currentTarget.style.border = 'none'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; }}
                  >
                    <Icon size={16} className="text-slate-300" />
                  </a>
                );
              })}
            </div>

            {/* Contact info */}
            <ul className="space-y-2">
              {[
                { icon: FiMapPin, text: '123 Commerce Street, Colombo, Sri Lanka' },
                { icon: FiPhone, text: '+94 11 234 5678', href: 'tel:+94112345678' },
                { icon: FiMail, text: 'hello@shophub.lk', href: 'mailto:hello@shophub.lk' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-400">
                    <Icon size={14} className="text-indigo-400 mt-0.5 shrink-0" />
                    {item.href
                      ? <a href={item.href} className="hover:text-indigo-400 transition-colors">{item.text}</a>
                      : <span>{item.text}</span>
                    }
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Link columns */}
          {[
            { title: 'Shop', links: footerLinks.shop },
            { title: 'Company', links: footerLinks.company },
            { title: 'Support', links: footerLinks.support },
            { title: 'Legal', links: footerLinks.legal },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href}
                      className="text-sm text-slate-400 hover:text-indigo-400 transition-colors duration-200 flex items-center gap-1.5 group"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">›</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment methods */}
        <div className="mb-10 pb-10" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Secure Payment Methods</p>
          <div className="flex flex-wrap gap-2">
            {paymentMethods.map((m) => (
              <span key={m}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 transition-colors hover:text-white"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            © {currentYear} <span className="font-bold text-slate-300">ShopHub</span>. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            Made with <FiHeart size={12} className="text-red-500 fill-current animate-bounce-subtle" /> for smart shoppers worldwide
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
