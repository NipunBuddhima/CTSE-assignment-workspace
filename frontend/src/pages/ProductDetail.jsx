import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiShoppingCart, FiStar, FiArrowLeft, FiMinus, FiPlus,
  FiHeart, FiShare2, FiTruck, FiShield, FiRefreshCw, FiCheck
} from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';
import { productService } from '../services/apiService';
import { svgPlaceholderDataUrl } from '../utils/placeholder';

const TABS = ['Description', 'Specifications', 'Reviews'];

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart, isAuthenticated } = useAppContext();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('Description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [cartState, setCartState] = useState('idle');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await productService.getProductById(productId);
        if (res.data?.data) setProduct(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  const handleAddToCart = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setCartState('adding');
    addToCart(product, quantity);
    setTimeout(() => setCartState('added'), 200);
    setTimeout(() => setCartState('idle'), 1800);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Loading product…</p>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>Product not found</h1>
        <button onClick={() => navigate('/products')} className="btn-primary">Back to Products</button>
      </div>
    </div>
  );

  const images = product.images?.length > 0 ? product.images : [null];
  const primaryImg = images[selectedImage]?.url ||
    svgPlaceholderDataUrl({ width: 700, height: 560, label: product.name?.slice(0, 16) || 'Product', sublabel: product.category || '' });
  const discountPct = product.price?.discount || 0;
  const inStock = product.inventory?.quantity > 0;
  const lowStock = inStock && product.inventory.quantity <= 5;
  const savings = discountPct > 0
    ? (product.price.originalPrice - product.price.currentPrice).toFixed(2)
    : null;

  return (
    <div className="min-h-screen py-8" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8 animate-fade-in">
          <Link to="/" className="hover:text-indigo-500 transition-colors" style={{ color: 'var(--color-text-muted)' }}>Home</Link>
          <span style={{ color: 'var(--color-border)' }}>/</span>
          <Link to="/products" className="hover:text-indigo-500 transition-colors" style={{ color: 'var(--color-text-muted)' }}>Products</Link>
          <span style={{ color: 'var(--color-border)' }}>/</span>
          <button onClick={() => navigate('/products')}
            className="flex items-center gap-1.5 font-medium hover:text-indigo-500 transition-colors"
            style={{ color: 'var(--color-text-muted)' }}>
            <FiArrowLeft size={14} /> Back
          </button>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 mb-12">

          {/* ── Image gallery ──────────────── */}
          <div className="animate-fade-left">
            {/* Main image */}
            <div className="relative rounded-2xl overflow-hidden mb-4 h-96 lg:h-[500px] img-hover-zoom"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <img src={primaryImg} alt={product.name} className="w-full h-full object-contain" />
              {discountPct > 0 && (
                <span className="absolute top-4 left-4 badge badge-danger text-sm shadow-lg animate-scale-in">
                  -{discountPct}% OFF
                </span>
              )}
              {!inStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="px-6 py-3 rounded-2xl bg-white/90 font-bold text-gray-800">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === i
                        ? 'border-indigo-500 shadow-glow'
                        : 'hover:border-indigo-300'
                    }`}
                    style={{ borderColor: selectedImage === i ? '#4f46e5' : 'var(--color-border)' }}>
                    <img
                      src={img?.url || svgPlaceholderDataUrl({ width: 80, height: 80, label: String(i + 1) })}
                      alt={`View ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product info ───────────────── */}
          <div className="animate-fade-up">
            {/* Category */}
            <span className="badge badge-primary mb-4">{product.category}</span>

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-black leading-tight mb-4" style={{ color: 'var(--color-text)' }}>
              {product.name}
            </h1>

            {/* Rating */}
            {product.rating?.averageRating > 0 && (
              <div className="flex items-center gap-3 mb-5">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} size={16}
                      className={i < Math.round(product.rating.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'} />
                  ))}
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                  {product.rating.averageRating.toFixed(1)} · {product.rating.reviewCount} reviews
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mb-6 p-5 rounded-2xl" style={{ background: 'var(--color-surface)' }}>
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-4xl font-black" style={{ color: 'var(--color-text)' }}>
                  ${product.price?.currentPrice?.toFixed(2)}
                </span>
                {product.price?.originalPrice > product.price?.currentPrice && (
                  <span className="text-xl line-through" style={{ color: 'var(--color-text-faint)' }}>
                    ${product.price?.originalPrice?.toFixed(2)}
                  </span>
                )}
              </div>
              {savings && (
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  You save ${savings} ({discountPct}% off)
                </p>
              )}
            </div>

            {/* Stock status */}
            <div className={`flex items-center gap-2.5 mb-6 px-4 py-3 rounded-xl border ${
              inStock
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50'
            }`}>
              <div className={`w-2.5 h-2.5 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
              <p className={`text-sm font-semibold ${inStock ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                {inStock
                  ? lowStock
                    ? `⚡ Only ${product.inventory.quantity} left — order soon!`
                    : `✓ In Stock · ${product.inventory.quantity} available`
                  : '✗ Out of Stock'}
              </p>
            </div>

            {/* Quantity selector */}
            {inStock && (
              <div className="mb-6">
                <label className="block text-sm font-bold mb-3" style={{ color: 'var(--color-text)' }}>Quantity</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                      style={{ color: 'var(--color-text)' }}>
                      <FiMinus size={16} />
                    </button>
                    <input
                      type="number" value={quantity} min={1} max={product.inventory.quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(product.inventory.quantity, parseInt(e.target.value) || 1)))}
                      className="w-14 text-center py-3 text-sm font-bold focus:outline-none"
                      style={{ background: 'var(--color-surface)', color: 'var(--color-text)', borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)' }}
                    />
                    <button onClick={() => setQuantity(Math.min(product.inventory.quantity, quantity + 1))}
                      className="px-4 py-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                      style={{ color: 'var(--color-text)' }}>
                      <FiPlus size={16} />
                    </button>
                  </div>
                  {quantity > 1 && (
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                      Subtotal: ${(product.price?.currentPrice * quantity).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex gap-3 mb-6">
              <button onClick={handleAddToCart} disabled={!inStock || cartState === 'adding'}
                className={`flex-1 py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2.5 transition-all duration-300 ${
                  !inStock ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : cartState === 'added' ? 'bg-emerald-500 text-white' : 'btn-primary'
                }`}>
                {cartState === 'added' ? <><FiCheck size={20} /> Added to Cart!</> : <><FiShoppingCart size={20} /> {inStock ? 'Add to Cart' : 'Out of Stock'}</>}
              </button>
              <button onClick={() => setIsWishlisted((p) => !p)}
                className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                  isWishlisted ? 'bg-red-500 border-red-500 text-white' : 'text-red-400 hover:border-red-400'
                }`}
                style={{ borderColor: isWishlisted ? undefined : 'var(--color-border)' }}>
                <FiHeart size={20} className={isWishlisted ? 'fill-current' : ''} />
              </button>
              <button className="p-4 rounded-2xl border-2 transition-all duration-200 hover:border-indigo-400"
                style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}>
                <FiShare2 size={20} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: FiTruck, label: 'Fast Delivery', sub: '2–3 business days' },
                { icon: FiShield, label: 'Secured', sub: 'Encrypted payments' },
                { icon: FiRefreshCw, label: 'Easy Returns', sub: '30-day policy' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="text-center p-3 rounded-xl" style={{ background: 'var(--color-surface)' }}>
                  <Icon size={18} className="text-indigo-500 mx-auto mb-1.5" />
                  <p className="text-[11px] font-bold" style={{ color: 'var(--color-text)' }}>{label}</p>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-faint)' }}>{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs section ──────────────────────────── */}
        <div className="card p-0 overflow-hidden animate-fade-up">
          <div className="flex" style={{ borderBottom: '1px solid var(--color-border)' }}>
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-bold transition-all duration-200 border-b-2 ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent'
                }`}
                style={{ color: activeTab === tab ? undefined : 'var(--color-text-muted)' }}>
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6 lg:p-8">
            {activeTab === 'Description' && (
              <div className="prose max-w-none animate-fade-in">
                <p className="text-base leading-relaxed" style={{ color: 'var(--color-text)' }}>
                  {product.description || 'No description available for this product.'}
                </p>
              </div>
            )}

            {activeTab === 'Specifications' && (
              <div className="animate-fade-in">
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(product.specifications).map(([key, val]) => val && (
                      <div key={key} className="flex items-start gap-3 p-4 rounded-xl"
                        style={{ background: 'var(--color-surface)' }}>
                        <span className="text-sm font-bold capitalize w-28 shrink-0" style={{ color: 'var(--color-text-muted)' }}>{key}</span>
                        <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--color-text-muted)' }}>No specifications available.</p>
                )}
              </div>
            )}

            {activeTab === 'Reviews' && (
              <div className="animate-fade-in">
                {product.rating?.reviewCount > 0 ? (
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-6xl font-black" style={{ color: 'var(--color-text)' }}>{product.rating.averageRating.toFixed(1)}</p>
                      <div className="flex gap-0.5 justify-center my-2">
                        {[...Array(5)].map((_, i) => (
                          <FiStar key={i} size={18} className={i < Math.round(product.rating.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
                        ))}
                      </div>
                      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{product.rating.reviewCount} reviews</p>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: 'var(--color-text-muted)' }}>No reviews yet. Be the first to review this product!</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
