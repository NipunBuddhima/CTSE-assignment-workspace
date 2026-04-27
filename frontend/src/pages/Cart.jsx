import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiTrash2, FiShoppingCart, FiArrowLeft, FiMinus, FiPlus,
  FiTruck, FiShield, FiRefreshCw, FiTag, FiArrowRight
} from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';
import { svgPlaceholderDataUrl } from '../utils/placeholder';

const TRUST = [
  { icon: FiShield, label: 'Secure checkout', sub: 'SSL encrypted' },
  { icon: FiTruck, label: 'Fast delivery', sub: '2–3 business days' },
  { icon: FiRefreshCw, label: 'Easy returns', sub: '30-day policy' },
];

const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateCartQuantity, getCartTotal, isAuthenticated, clearCart } = useAppContext();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-center max-w-md mx-auto px-6 animate-fade-up">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            <FiShoppingCart size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-black mb-3" style={{ color: 'var(--color-text)' }}>Sign in to view your cart</h1>
          <p className="mb-8" style={{ color: 'var(--color-text-muted)' }}>
            Your cart items are saved and waiting for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/login')} className="btn-primary px-8 py-3 text-base font-bold">
              Sign In
            </button>
            <button onClick={() => navigate('/products')} className="btn-secondary px-8 py-3 text-base font-bold">
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-center max-w-md mx-auto px-6 animate-fade-up">
          <div className="relative mx-auto mb-6 w-32 h-32">
            <div className="w-32 h-32 rounded-3xl flex items-center justify-center shadow-xl"
              style={{ background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)' }}>
              <FiShoppingCart size={52} className="text-slate-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-indigo-100 border-4 border-white dark:border-gray-900 flex items-center justify-center text-lg">
              0
            </div>
          </div>
          <h1 className="text-3xl font-black mb-3" style={{ color: 'var(--color-text)' }}>Your cart is empty</h1>
          <p className="mb-8" style={{ color: 'var(--color-text-muted)' }}>
            Looks like you haven't added anything yet. Start exploring!
          </p>
          <button onClick={() => navigate('/products')} className="btn-primary px-10 py-3.5 text-base font-bold">
            Continue Shopping <FiArrowRight />
          </button>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen py-10" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <div>
            <button onClick={() => navigate('/products')}
              className="flex items-center gap-2 text-sm font-semibold mb-2 hover:text-indigo-500 transition-colors"
              style={{ color: 'var(--color-text-muted)' }}>
              <FiArrowLeft size={16} /> Back to Shopping
            </button>
            <h1 className="text-3xl font-black" style={{ color: 'var(--color-text)' }}>
              Shopping Cart
              <span className="ml-3 text-lg font-bold" style={{ color: 'var(--color-text-muted)' }}>
                ({cart.length} {cart.length === 1 ? 'item' : 'items'})
              </span>
            </h1>
          </div>
          <button onClick={clearCart}
            className="text-sm text-red-400 hover:text-red-500 font-semibold transition-colors hidden sm:block">
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Cart items ──────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, idx) => {
              const imgUrl = item.images?.[0]?.url || svgPlaceholderDataUrl({
                width: 280, height: 220,
                label: String(item.name || '').slice(0, 14),
              });
              const price = item.price?.currentPrice || item.currentPrice || 0;
              const origPrice = item.price?.originalPrice || item.originalPrice;

              return (
                <div key={item.productId}
                  className="card p-5 flex gap-5 animate-fade-up"
                  style={{ animationDelay: `${idx * 60}ms` }}>

                  {/* Image */}
                  <Link to={`/product/${item.productId}`}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden flex-shrink-0 img-hover-zoom"
                    style={{ background: 'var(--color-surface)' }}>
                    <img src={imgUrl} alt={item.name} className="w-full h-full object-cover" />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold uppercase tracking-widest block mb-1" style={{ color: 'var(--color-primary)' }}>
                          {item.category}
                        </span>
                        <Link to={`/product/${item.productId}`}>
                          <h3 className="font-bold text-sm sm:text-base leading-snug hover:text-indigo-500 transition-colors truncate"
                            style={{ color: 'var(--color-text)' }}>
                            {item.name}
                          </h3>
                        </Link>
                        {item.sku && <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-faint)' }}>SKU: {item.sku}</p>}
                      </div>

                      {/* Remove */}
                      <button onClick={() => removeFromCart(item.productId)}
                        className="p-2 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex-shrink-0">
                        <FiTrash2 size={16} />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                      {/* Quantity stepper */}
                      <div className="flex items-center rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
                        <button onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                          className="px-3 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                          style={{ color: 'var(--color-text)' }}>
                          <FiMinus size={14} />
                        </button>
                        <span className="w-10 text-center text-sm font-bold py-2"
                          style={{ background: 'var(--color-surface)', color: 'var(--color-text)', borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)' }}>
                          {item.quantity}
                        </span>
                        <button onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                          className="px-3 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                          style={{ color: 'var(--color-text)' }}>
                          <FiPlus size={14} />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-base font-black" style={{ color: 'var(--color-text)' }}>
                          ${(price * item.quantity).toFixed(2)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            ${price.toFixed(2)} each
                          </p>
                        )}
                        {origPrice > price && (
                          <p className="text-xs line-through" style={{ color: 'var(--color-text-faint)' }}>
                            ${(origPrice * item.quantity).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Order summary ───────────────────────── */}
          <div className="space-y-4">
            {/* Promo code */}
            <div className="card p-5 animate-fade-up">
              <label className="block text-sm font-bold mb-3 flex items-center gap-2"
                style={{ color: 'var(--color-text)' }}>
                <FiTag size={15} className="text-indigo-500" /> Promo Code
              </label>
              <div className="flex gap-2">
                <input type="text" placeholder="Enter code…" className="input-field text-sm flex-1" />
                <button className="btn-secondary text-sm px-4 py-2">Apply</button>
              </div>
            </div>

            {/* Summary card */}
            <div className="card p-6 sticky top-24 animate-fade-up" style={{ animationDelay: '80ms' }}>
              <h2 className="text-xl font-black mb-5" style={{ color: 'var(--color-text)' }}>Order Summary</h2>

              <div className="space-y-3 mb-5 pb-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-text-muted)' }}>Subtotal ({cart.reduce((a, i) => a + i.quantity, 0)} items)</span>
                  <span className="font-semibold" style={{ color: 'var(--color-text)' }}>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-text-muted)' }}>Shipping</span>
                  <span className="font-semibold" style={{ color: shipping === 0 ? '#16a34a' : 'var(--color-text)' }}>
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-text-muted)' }}>Tax (8%)</span>
                  <span className="font-semibold" style={{ color: 'var(--color-text)' }}>${tax.toFixed(2)}</span>
                </div>
                {shipping === 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <FiTruck size={13} /> Free shipping applied!
                  </div>
                )}
                {shipping > 0 && (
                  <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
                    Add ${(50 - subtotal).toFixed(2)} more for free shipping
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-black" style={{ color: 'var(--color-text)' }}>Total</span>
                <span className="text-2xl font-black" style={{ color: 'var(--color-text)' }}>${total.toFixed(2)}</span>
              </div>

              <button onClick={() => navigate('/checkout')} className="btn-primary w-full py-4 text-base font-bold mb-3">
                Proceed to Checkout <FiArrowRight />
              </button>
              <button onClick={() => navigate('/products')} className="btn-secondary w-full py-3 text-sm font-semibold">
                Continue Shopping
              </button>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2 mt-5 pt-5" style={{ borderTop: '1px solid var(--color-border)' }}>
                {TRUST.map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="text-center">
                    <Icon size={16} className="text-indigo-500 mx-auto mb-1" />
                    <p className="text-[10px] font-bold leading-tight" style={{ color: 'var(--color-text)' }}>{label}</p>
                    <p className="text-[9px]" style={{ color: 'var(--color-text-faint)' }}>{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
