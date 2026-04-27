import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft, FiCheck, FiCreditCard, FiTruck,
  FiFileText, FiShield, FiLock
} from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';
import { orderService, paymentService } from '../services/apiService';
import { svgPlaceholderDataUrl } from '../utils/placeholder';

const STEPS = [
  { id: 1, label: 'Shipping',  icon: FiTruck },
  { id: 2, label: 'Billing',   icon: FiFileText },
  { id: 3, label: 'Payment',   icon: FiCreditCard },
  { id: 4, label: 'Confirmed', icon: FiCheck },
];

const PAY_METHODS = [
  { value: 'credit_card',  label: 'Credit Card',  icon: '💳' },
  { value: 'debit_card',   label: 'Debit Card',   icon: '🏦' },
  { value: 'paypal',       label: 'PayPal',        icon: '🔵' },
];

const Field = ({ label, ...props }) => (
  <div>
    {label && (
      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5"
        style={{ color: 'var(--color-text-muted)' }}>{label}</label>
    )}
    <input {...props} className="input-field text-sm" />
  </div>
);

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, user, getCartTotal, clearCart, removeFromCart, showNotification, setLoading } = useAppContext();
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);

  const [shipping, setShipping] = useState({
    fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    email: user?.email || '', phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '', state: user?.address?.state || '',
    postalCode: user?.address?.postalCode || '', country: 'US',
  });

  const [billing, setBilling] = useState({
    sameAsShipping: true,
    fullName: '', street: '', city: '', state: '', postalCode: '', country: 'US',
  });

  const [payment, setPayment] = useState({
    method: 'credit_card', cardNumber: '', cardName: '', expiryDate: '', cvv: '',
  });

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-black mb-4" style={{ color: 'var(--color-text)' }}>Your cart is empty</h1>
          <Link to="/products" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  const setS = (key, val) => setShipping((p) => ({ ...p, [key]: val }));
  const setB = (key, val) => setBilling((p) => ({ ...p, [key]: val }));
  const setP = (key, val) => setPayment((p) => ({ ...p, [key]: val }));

  const handlePlaceOrder = async () => {
    try {
      if (!user?.userId) {
        showNotification('Please log in again to place your order.', 'error');
        navigate('/login');
        return;
      }

      setProcessing(true);
      setLoading(true);
      const orderRes = await orderService.createOrder({
        userId: user.userId,
        items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress: shipping,
        billingAddress: billing.sameAsShipping ? shipping : billing,
      });
      if (orderRes.data?.success) {
        const orderId = orderRes.data.data.orderId;
        const payRes = await paymentService.createPayment({
          orderId, userId: user.userId, amount: getCartTotal(),
          paymentMethod: { type: payment.method, cardNumber: payment.cardNumber, cardName: payment.cardName },
        });
        if (payRes.data?.success) {
          await paymentService.processPayment(payRes.data.data.paymentId);
          showNotification('🎉 Order placed successfully!', 'success');
          clearCart();
          setStep(4);
        }
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Error placing order';

      if (message.startsWith('Error retrieving product')) {
        const missingProductId = message.split('Error retrieving product ')[1];
        if (missingProductId) {
          removeFromCart(missingProductId.trim());
        }
        showNotification('One cart item is no longer available and was removed. Please review cart and try again.', 'error');
        navigate('/cart');
      } else {
        showNotification(message, 'error');
      }
    } finally {
      setProcessing(false);
      setLoading(false);
    }
  };

  const subtotal = getCartTotal();
  const shippingFee = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingFee + tax;

  return (
    <div className="min-h-screen py-10" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back link */}
        <button onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-sm font-semibold mb-6 hover:text-indigo-500 transition-colors"
          style={{ color: 'var(--color-text-muted)' }}>
          <FiArrowLeft size={16} /> Back to Cart
        </button>

        <h1 className="text-3xl font-black mb-8" style={{ color: 'var(--color-text)' }}>Checkout</h1>

        {/* Step indicator */}
        <div className="mb-10">
          <div className="flex items-center gap-0 mb-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <React.Fragment key={s.id}>
                  <div className={`flex flex-col items-center`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      s.id < step ? 'text-white shadow-md' : s.id === step ? 'text-white shadow-glow' : ''
                    }`}
                      style={s.id < step
                        ? { background: 'linear-gradient(135deg,#22c55e,#16a34a)' }
                        : s.id === step
                        ? { background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }
                        : { background: 'var(--color-surface)', color: 'var(--color-text-faint)', border: '2px solid var(--color-border)' }
                      }>
                      {s.id < step ? <FiCheck size={16} /> : <Icon size={16} />}
                    </div>
                    <span className="text-[10px] font-semibold mt-1 hidden sm:block"
                      style={{ color: s.id <= step ? 'var(--color-primary)' : 'var(--color-text-faint)' }}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 rounded-full mx-1 mb-4 transition-all"
                      style={{ background: s.id < step ? 'linear-gradient(90deg,#4f46e5,#7c3aed)' : 'var(--color-border)' }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Form area ────────────────────────── */}
          <div className="lg:col-span-2">

            {/* Step 1: Shipping */}
            {step === 1 && (
              <div className="card p-6 animate-fade-up">
                <h2 className="text-xl font-black mb-6" style={{ color: 'var(--color-text)' }}>
                  <FiTruck className="inline mr-2 text-indigo-500" />Shipping Address
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Full Name" placeholder="John Doe" value={shipping.fullName} onChange={(e) => setS('fullName', e.target.value)} required />
                    <Field label="Email" type="email" placeholder="you@email.com" value={shipping.email} onChange={(e) => setS('email', e.target.value)} />
                  </div>
                  <Field label="Phone" type="tel" placeholder="+1 234 567 890" value={shipping.phone} onChange={(e) => setS('phone', e.target.value)} />
                  <Field label="Street Address" placeholder="123 Main Street, Apt 4B" value={shipping.street} onChange={(e) => setS('street', e.target.value)} required />
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="City" placeholder="New York" value={shipping.city} onChange={(e) => setS('city', e.target.value)} />
                    <Field label="State / Province" placeholder="NY" value={shipping.state} onChange={(e) => setS('state', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Postal Code" placeholder="10001" value={shipping.postalCode} onChange={(e) => setS('postalCode', e.target.value)} />
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Country</label>
                      <select value={shipping.country} onChange={(e) => setS('country', e.target.value)} className="input-field text-sm">
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="LK">Sri Lanka</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button onClick={() => setStep(2)} className="btn-primary w-full py-3.5 mt-6 text-base font-bold">
                  Continue to Billing <FiArrowLeft className="rotate-180" size={16} />
                </button>
              </div>
            )}

            {/* Step 2: Billing */}
            {step === 2 && (
              <div className="card p-6 animate-fade-up">
                <h2 className="text-xl font-black mb-6" style={{ color: 'var(--color-text)' }}>
                  <FiFileText className="inline mr-2 text-indigo-500" />Billing Address
                </h2>
                <label className="flex items-center gap-3 mb-6 cursor-pointer p-4 rounded-xl transition-colors"
                  style={{ background: 'var(--color-surface)' }}>
                  <input type="checkbox" checked={billing.sameAsShipping}
                    onChange={(e) => setB('sameAsShipping', e.target.checked)} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                    Same as shipping address
                  </span>
                </label>
                {!billing.sameAsShipping && (
                  <div className="space-y-4 mb-6 animate-fade-in">
                    <Field label="Full Name" placeholder="John Doe" value={billing.fullName} onChange={(e) => setB('fullName', e.target.value)} />
                    <Field label="Street Address" placeholder="123 Main St" value={billing.street} onChange={(e) => setB('street', e.target.value)} />
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="City" placeholder="City" value={billing.city} onChange={(e) => setB('city', e.target.value)} />
                      <Field label="State" placeholder="State" value={billing.state} onChange={(e) => setB('state', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Postal Code" placeholder="10001" value={billing.postalCode} onChange={(e) => setB('postalCode', e.target.value)} />
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Country</label>
                        <select value={billing.country} onChange={(e) => setB('country', e.target.value)} className="input-field text-sm">
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="UK">United Kingdom</option>
                          <option value="AU">Australia</option>
                          <option value="LK">Sri Lanka</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3 font-bold">Back</button>
                  <button onClick={() => setStep(3)} className="btn-primary flex-1 py-3 font-bold">Continue to Payment</button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="card p-6 animate-fade-up">
                <h2 className="text-xl font-black mb-6" style={{ color: 'var(--color-text)' }}>
                  <FiCreditCard className="inline mr-2 text-indigo-500" />Payment Method
                </h2>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {PAY_METHODS.map((m) => (
                    <label key={m.value} className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all"
                      style={{
                        borderColor: payment.method === m.value ? '#4f46e5' : 'var(--color-border)',
                        background: payment.method === m.value ? 'rgba(99,102,241,0.08)' : 'var(--color-surface)',
                      }}>
                      <input type="radio" name="method" value={m.value} checked={payment.method === m.value}
                        onChange={(e) => setP('method', e.target.value)} className="sr-only" />
                      <span className="text-2xl">{m.icon}</span>
                      <span className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>{m.label}</span>
                    </label>
                  ))}
                </div>
                {payment.method.includes('card') && (
                  <div className="space-y-4 mb-6 p-5 rounded-2xl animate-fade-in" style={{ background: 'var(--color-surface)' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <FiLock size={14} className="text-emerald-500" />
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Secured with SSL encryption</span>
                    </div>
                    <Field label="Card Number" placeholder="1234 5678 9012 3456" maxLength={16} value={payment.cardNumber} onChange={(e) => setP('cardNumber', e.target.value)} />
                    <Field label="Cardholder Name" placeholder="John Doe" value={payment.cardName} onChange={(e) => setP('cardName', e.target.value)} />
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Expiry (MM/YY)" placeholder="12/26" maxLength={5} value={payment.expiryDate} onChange={(e) => setP('expiryDate', e.target.value)} />
                      <Field label="CVV" placeholder="•••" maxLength={3} value={payment.cvv} onChange={(e) => setP('cvv', e.target.value)} />
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="btn-secondary flex-1 py-3 font-bold">Back</button>
                  <button onClick={handlePlaceOrder} disabled={processing}
                    className="btn-primary flex-1 py-3 font-bold gap-2">
                    {processing
                      ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Processing…</>
                      : <><FiLock size={15} /> Place Order ${total.toFixed(2)}</>
                    }
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <div className="card p-8 text-center animate-scale-in">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
                  style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>
                  <FiCheck size={36} className="text-white" />
                </div>
                <h2 className="text-2xl font-black mb-2" style={{ color: 'var(--color-text)' }}>Order Confirmed! 🎉</h2>
                <p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>
                  Thank you for your purchase. Your order has been placed successfully.
                </p>
                <div className="p-5 rounded-2xl text-left mb-8" style={{ background: 'var(--color-surface)' }}>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    A confirmation email has been sent to <strong style={{ color: 'var(--color-text)' }}>{shipping.email}</strong>
                  </p>
                  <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
                    Track your order anytime in My Orders.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => navigate('/orders')} className="btn-primary flex-1 py-3 font-bold">View My Orders</button>
                  <button onClick={() => navigate('/products')} className="btn-secondary flex-1 py-3 font-bold">Continue Shopping</button>
                </div>
              </div>
            )}
          </div>

          {/* ── Order summary panel ──────────────── */}
          {step < 4 && (
            <div className="space-y-4">
              <div className="card p-5 sticky top-24 animate-fade-up">
                <h3 className="font-black text-base mb-4" style={{ color: 'var(--color-text)' }}>
                  Order Summary
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4 pr-1">
                  {cart.map((item) => {
                    const price = item.price?.currentPrice || item.currentPrice || 0;
                    const imgUrl = item.images?.[0]?.url || svgPlaceholderDataUrl({ width: 80, height: 80, label: String(item.name || '').slice(0, 8) });
                    return (
                      <div key={item.productId} className="flex items-start gap-3 pb-3"
                        style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <img src={imgUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          style={{ background: 'var(--color-surface)' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>{item.name}</p>
                          <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-black flex-shrink-0" style={{ color: 'var(--color-text)' }}>
                          ${(price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                  {[
                    ['Subtotal', `$${subtotal.toFixed(2)}`],
                    ['Shipping', shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`],
                    ['Tax (8%)', `$${tax.toFixed(2)}`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span style={{ color: 'var(--color-text-muted)' }}>{k}</span>
                      <span className="font-semibold" style={{ color: v === 'FREE' ? '#16a34a' : 'var(--color-text)' }}>{v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 mt-1" style={{ borderTop: '1px solid var(--color-border)' }}>
                    <span className="font-black" style={{ color: 'var(--color-text)' }}>Total</span>
                    <span className="font-black text-lg" style={{ color: 'var(--color-text)' }}>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Security badge */}
                <div className="mt-4 pt-4 flex items-center gap-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <FiShield size={14} className="text-emerald-500 flex-shrink-0" />
                  <p className="text-[11px]" style={{ color: 'var(--color-text-faint)' }}>
                    256-bit SSL encryption · Your data is safe
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
