import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiPackage, FiTruck, FiCheckCircle, FiClock,
  FiAlertCircle, FiEye, FiX, FiShoppingBag, FiArrowRight
} from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';
import { orderService } from '../services/apiService';

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: 'badge-warning', icon: FiClock,        dot: 'bg-amber-400',   step: 0 },
  processing: { label: 'Processing', color: 'badge-primary', icon: FiPackage,      dot: 'bg-indigo-500',  step: 1 },
  shipped:    { label: 'Shipped',    color: 'badge-primary', icon: FiTruck,        dot: 'bg-blue-500',    step: 2 },
  delivered:  { label: 'Delivered',  color: 'badge-success', icon: FiCheckCircle,  dot: 'bg-emerald-500', step: 3 },
  cancelled:  { label: 'Cancelled',  color: 'badge-danger',  icon: FiAlertCircle,  dot: 'bg-red-500',     step: -1 },
};

const STEPS = ['Placed', 'Processing', 'Shipped', 'Delivered'];
const STATUS_FILTERS = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const Orders = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    (async () => {
      try {
        setLoading(true);
        const res = await orderService.getUserOrders(user?.userId);
        setOrders(res.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, navigate, user?.userId]);

  const filtered = statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="min-h-screen py-10" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <h1 className="text-3xl font-black" style={{ color: 'var(--color-text)' }}>My Orders</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Track and manage all your orders in one place
          </p>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 animate-fade-up">
          {STATUS_FILTERS.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 border ${
                statusFilter === s ? 'text-white border-transparent' : ''
              }`}
              style={statusFilter === s
                ? { background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none' }
                : { background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="skeleton h-4 w-40 rounded mb-4" />
                <div className="skeleton h-3 w-full rounded mb-2" />
                <div className="skeleton h-3 w-2/3 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 card animate-fade-up">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg"
              style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
              <FiShoppingBag size={36} className="text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
              {statusFilter === 'all' ? 'No orders yet' : `No ${statusFilter} orders`}
            </h3>
            <p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>
              {statusFilter === 'all'
                ? "You haven't placed any orders yet. Start exploring our products!"
                : 'Try a different status filter.'}
            </p>
            <Link to="/products" className="btn-primary">
              Browse Products <FiArrowRight />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order, idx) => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const Icon = cfg.icon;
              const step = cfg.step;
              return (
                <div key={order.orderId}
                  className="card overflow-hidden animate-fade-up"
                  style={{ animationDelay: `${idx * 60}ms` }}>

                  {/* Card header */}
                  <div className="flex items-center justify-between px-6 py-4"
                    style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot} animate-pulse`} />
                      <span className="font-black text-sm" style={{ color: 'var(--color-text)' }}>
                        Order #{order.orderId?.substring(0, 8).toUpperCase()}
                      </span>
                      <span className={`badge ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="p-6">
                    {/* Progress timeline (not for cancelled) */}
                    {step >= 0 && (
                      <div className="flex items-center mb-6 gap-0">
                        {STEPS.map((label, i) => (
                          <React.Fragment key={label}>
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                i <= step
                                  ? 'text-white shadow-md'
                                  : ''
                              }`}
                                style={i <= step
                                  ? { background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }
                                  : { background: 'var(--color-surface)', color: 'var(--color-text-faint)', border: '2px solid var(--color-border)' }}>
                                {i < step ? '✓' : i + 1}
                              </div>
                              <span className="text-[10px] mt-1 font-medium whitespace-nowrap"
                                style={{ color: i <= step ? 'var(--color-primary)' : 'var(--color-text-faint)' }}>
                                {label}
                              </span>
                            </div>
                            {i < STEPS.length - 1 && (
                              <div className="flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all"
                                style={{ background: i < step ? 'linear-gradient(90deg,#4f46e5,#7c3aed)' : 'var(--color-border)' }} />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    )}

                    {/* Order meta */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                      {[
                        { label: 'Items', val: `${order.items?.length || 0} item${(order.items?.length || 0) !== 1 ? 's' : ''}` },
                        { label: 'Payment', val: order.payment?.status?.toUpperCase() || 'N/A' },
                        { label: 'Total', val: `$${order.summary?.total?.toFixed(2) || '0.00'}` },
                        { label: 'Tracking', val: order.tracking?.trackingNumber || 'N/A' },
                      ].map(({ label, val }) => (
                        <div key={label} className="p-3 rounded-xl" style={{ background: 'var(--color-surface)' }}>
                          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-faint)' }}>{label}</p>
                          <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{val}</p>
                        </div>
                      ))}
                    </div>

                    {/* Items preview */}
                    {order.items?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-5">
                        {order.items.slice(0, 3).map((item, i) => (
                          <span key={i} className="badge badge-neutral">
                            {item.productName} ×{item.quantity}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="badge badge-neutral">+{order.items.length - 3} more</span>
                        )}
                      </div>
                    )}

                    {/* View details */}
                    <button onClick={() => setSelectedOrder(order)}
                      className="btn-secondary text-sm py-2 gap-2">
                      <FiEye size={14} /> View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Order Details Modal ─────────────────────────── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl animate-fade-up"
            style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>

            {/* Modal header */}
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 z-10"
              style={{ background: 'var(--color-bg-card)', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <h2 className="font-black text-lg" style={{ color: 'var(--color-text)' }}>
                  Order #{selectedOrder.orderId?.substring(0, 8).toUpperCase()}
                </h2>
                <span className={`badge ${(STATUS_CONFIG[selectedOrder.status] || STATUS_CONFIG.pending).color}`}>
                  {(STATUS_CONFIG[selectedOrder.status] || STATUS_CONFIG.pending).label}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                style={{ color: 'var(--color-text-muted)' }}>
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Items */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-4 rounded-xl"
                      style={{ background: 'var(--color-surface)' }}>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{item.productName}</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          SKU: {item.sku} · Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-black" style={{ color: 'var(--color-text)' }}>
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>Summary</h3>
                <div className="p-4 rounded-xl space-y-2" style={{ background: 'var(--color-surface)' }}>
                  {[
                    ['Subtotal', `$${selectedOrder.summary?.subtotal?.toFixed(2) || '0.00'}`],
                    ['Shipping', `$${selectedOrder.summary?.shipping?.toFixed(2) || '0.00'}`],
                    ['Tax', `$${selectedOrder.summary?.tax?.toFixed(2) || '0.00'}`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span style={{ color: 'var(--color-text-muted)' }}>{k}</span>
                      <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{v}</span>
                    </div>
                  ))}
                  {selectedOrder.summary?.discount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>Discount</span>
                      <span className="font-semibold">-${selectedOrder.summary.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                    <span className="font-bold" style={{ color: 'var(--color-text)' }}>Total</span>
                    <span className="font-black text-lg" style={{ color: 'var(--color-text)' }}>
                      ${selectedOrder.summary?.total?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping address */}
              {selectedOrder.shippingAddress && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>Shipping Address</h3>
                  <div className="p-4 rounded-xl text-sm" style={{ background: 'var(--color-surface)' }}>
                    <p className="font-semibold" style={{ color: 'var(--color-text)' }}>{selectedOrder.shippingAddress.fullName}</p>
                    <p style={{ color: 'var(--color-text-muted)' }}>{selectedOrder.shippingAddress.street}</p>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                    </p>
                    <p style={{ color: 'var(--color-text-muted)' }}>{selectedOrder.shippingAddress.country}</p>
                  </div>
                </div>
              )}

              <button onClick={() => setSelectedOrder(null)} className="btn-secondary w-full py-3 font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
