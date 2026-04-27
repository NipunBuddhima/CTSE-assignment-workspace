import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiShoppingCart, FiStar, FiHeart, FiEye, FiCheck } from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';
import { svgPlaceholderDataUrl } from '../utils/placeholder';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, isAuthenticated } = useAppContext();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [cartState, setCartState] = useState('idle'); // idle | adding | added

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    setCartState('adding');
    addToCart(product);
    setTimeout(() => setCartState('added'), 200);
    setTimeout(() => setCartState('idle'), 1600);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted((p) => !p);
  };

  const handleViewProduct = (e) => {
    e?.preventDefault();
    navigate(`/product/${product.productId}`);
  };

  const discountPct = product.price?.discount || 0;
  const primaryImageUrl =
    product.images?.[0]?.url ||
    svgPlaceholderDataUrl({
      width: 480, height: 380,
      label: product.name ? String(product.name).slice(0, 16) : 'No Image',
      sublabel: product.category || '',
    });

  const rating = product.rating?.averageRating || 0;
  const reviewCount = product.rating?.reviewCount || 0;
  const isOutOfStock = product.inventory?.quantity === 0;
  const isLowStock = product.inventory?.quantity > 0 && product.inventory?.quantity <= 5;

  return (
    <div className="group h-full">
      <div
        className="card card-hover h-full flex flex-col cursor-pointer"
        onClick={handleViewProduct}
      >
        {/* ── Image Area ───────────────────────── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 h-60 flex-shrink-0">
          <img
            src={primaryImageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
            style={{ '--tw-scale-x': '1.08', '--tw-scale-y': '1.08' }}
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end pb-4 gap-2">
            <button
              onClick={handleViewProduct}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-indigo-700 bg-white/95 hover:bg-white shadow-lg transition-all duration-300 translate-y-2 group-hover:translate-y-0"
            >
              <FiEye size={15} /> Quick View
            </button>
          </div>

          {/* Top overlay badges */}
          <div className="absolute inset-0 p-3 flex flex-col justify-between pointer-events-none">
            {/* Top row */}
            <div className="flex justify-between items-start">
              {discountPct > 0
                ? <span className="badge badge-danger shadow-md animate-scale-in">-{discountPct}%</span>
                : <span />
              }
              {/* Wishlist */}
              <button
                onClick={handleWishlist}
                className={`pointer-events-auto p-2 rounded-xl backdrop-blur-md shadow-md transition-all duration-200 active:scale-90 ${
                  isWishlisted
                    ? 'bg-red-500 text-white'
                    : 'bg-white/90 dark:bg-slate-800/90 text-red-400 hover:bg-white'
                }`}
              >
                <FiHeart size={15} className={isWishlisted ? 'fill-current' : ''} />
              </button>
            </div>

            {/* Bottom badges */}
            <div className="flex gap-2">
              {isLowStock && (
                <span className="badge badge-warning shadow-md">Only {product.inventory.quantity} left!</span>
              )}
              {isOutOfStock && (
                <span className="badge badge-danger shadow-md">Out of Stock</span>
              )}
            </div>
          </div>

          {/* Out of stock veil */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="px-4 py-2 rounded-xl bg-white/90 backdrop-blur-sm text-center">
                <p className="font-bold text-gray-800 text-sm">Out of Stock</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Content Area ─────────────────────── */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Category */}
          <span className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-primary)' }}>
            {product.category}
          </span>

          {/* Name */}
          <h3
            className="text-sm font-bold mb-2 line-clamp-2 leading-snug hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            style={{ color: 'var(--color-text)' }}
          >
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            {rating > 0 ? (
              <>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      size={12}
                      className={i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
                  {rating.toFixed(1)} ({reviewCount})
                </span>
              </>
            ) : (
              <span className="text-[11px]" style={{ color: 'var(--color-text-faint)' }}>No reviews yet</span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-xl font-black" style={{ color: 'var(--color-text)' }}>
              ${product.price?.currentPrice?.toFixed(2)}
            </span>
            {product.price?.originalPrice > product.price?.currentPrice && (
              <span className="text-sm line-through" style={{ color: 'var(--color-text-faint)' }}>
                ${product.price?.originalPrice?.toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock info */}
          {!isOutOfStock && (
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mb-3">
              ✓ {product.inventory?.quantity} in stock
            </p>
          )}

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || cartState === 'adding'}
            className={`mt-auto w-full py-2.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
              isOutOfStock
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                : cartState === 'added'
                ? 'bg-emerald-500 text-white scale-95'
                : 'btn-primary'
            }`}
          >
            {cartState === 'added' ? (
              <><FiCheck size={15} /> Added!</>
            ) : (
              <><FiShoppingCart size={15} /> {isOutOfStock ? 'Unavailable' : 'Add to Cart'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
