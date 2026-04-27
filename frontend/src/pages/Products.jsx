import React, { useState, useEffect } from 'react';
import {
  FiFilter, FiX, FiSearch, FiSliders, FiRefreshCw,
  FiPackage, FiGrid, FiList, FiChevronDown
} from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/apiService';

const CATEGORIES = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Beauty'];

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price-low',  label: 'Price: Low → High' },
  { value: 'price-high', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Highest Rated' },
  { value: 'popular',    label: 'Most Popular' },
];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const [filters, setFilters] = useState({
    category: '',
    minPrice: 0,
    maxPrice: 10000,
    sortBy: 'newest',
    search: '',
  });

  // Read category from URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat) setFilters((f) => ({ ...f, category: cat }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {
          ...(filters.category && { category: filters.category }),
          ...(filters.search && { search: filters.search }),
          ...(filters.minPrice && { minPrice: filters.minPrice }),
          ...(filters.maxPrice < 10000 && { maxPrice: filters.maxPrice }),
          ...(filters.sortBy && { sortBy: filters.sortBy }),
        };
        const response = await productService.getAllProducts(params);
        if (!cancelled) {
          setProducts(response.data?.data || []);
          setError(null);
        }
      } catch {
        if (!cancelled) setError('Failed to load products. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProducts();
    return () => { cancelled = true; };
  }, [filters]);

  const set = (key, val) => setFilters((f) => ({ ...f, [key]: val }));

  const resetFilters = () => setFilters({
    category: '', minPrice: 0, maxPrice: 10000, sortBy: 'newest', search: '',
  });

  const activeFilterCount = [
    filters.category,
    filters.search,
    filters.minPrice > 0,
    filters.maxPrice < 10000,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen py-10" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <span className="badge badge-primary mb-3">
            <FiSliders size={10} /> Curated Collections
          </span>
          <h1 className="text-4xl font-black tracking-tight" style={{ color: 'var(--color-text)' }}>All Products</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Find your next favorite item with smart filters
          </p>
        </div>

        {/* Mobile filter backdrop */}
        {showFilters && (
          <div className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setShowFilters(false)} />
        )}

        <div className="flex flex-col md:flex-row gap-8">

          {/* ── Sidebar ───────────────────────────────── */}
          <aside className={`fixed md:static inset-y-0 left-0 z-40 w-[85vw] max-w-xs md:w-72 md:flex-shrink-0
            overflow-y-auto md:overflow-visible transition-transform duration-300
            ${showFilters ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
            style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '1.25rem', maxHeight: 'fit-content' }}>

            <div className="p-5">
              {/* Sidebar header */}
              <div className="flex items-center justify-between mb-5 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <div className="flex items-center gap-2">
                  <FiSliders size={16} style={{ color: 'var(--color-primary)' }} />
                  <span className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="badge badge-primary">{activeFilterCount}</span>
                  )}
                </div>
                <button className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setShowFilters(false)}>
                  <FiX size={18} style={{ color: 'var(--color-text)' }} />
                </button>
              </div>

              {/* Search */}
              <div className="mb-5">
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>
                  Search
                </label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" size={15}
                    style={{ color: 'var(--color-text-faint)' }} />
                  <input
                    type="text"
                    placeholder="Search products…"
                    value={filters.search}
                    onChange={(e) => set('search', e.target.value)}
                    className="input-field pl-9 text-sm"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="mb-5">
                <label className="block text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => set('category', '')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      filters.category === '' ? 'text-white border-transparent' : ''
                    }`}
                    style={filters.category === ''
                      ? { background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none' }
                      : { background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                  >
                    All
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => set('category', cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        filters.category === cat ? 'text-white border-transparent' : ''
                      }`}
                      style={filters.category === cat
                        ? { background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none' }
                        : { background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div className="mb-5">
                <label className="block text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>
                  Price Range
                </label>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                      <span>Min: ${filters.minPrice}</span>
                    </div>
                    <input type="range" min="0" max="10000" value={filters.minPrice}
                      onChange={(e) => set('minPrice', parseInt(e.target.value))} />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                      <span>Max: ${filters.maxPrice === 10000 ? '10,000+' : filters.maxPrice}</span>
                    </div>
                    <input type="range" min="0" max="10000" value={filters.maxPrice}
                      onChange={(e) => set('maxPrice', parseInt(e.target.value))} />
                  </div>
                </div>
              </div>

              {/* Sort by */}
              <div className="mb-5">
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>
                  Sort By
                </label>
                <div className="relative">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => set('sortBy', e.target.value)}
                    className="input-field text-sm pr-8 appearance-none"
                    style={{ cursor: 'pointer' }}
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <FiChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--color-text-muted)' }} />
                </div>
              </div>

              {/* Reset */}
              {activeFilterCount > 0 && (
                <button onClick={resetFilters} className="btn-secondary w-full text-sm">
                  <FiRefreshCw size={14} /> Reset All Filters
                </button>
              )}
            </div>
          </aside>

          {/* ── Main content ──────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Top bar */}
            <div className="flex items-center justify-between gap-4 mb-6 p-4 rounded-2xl"
              style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(true)}
                  className="md:hidden btn-secondary text-sm py-2 px-3 gap-2"
                >
                  <FiFilter size={14} />
                  Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </button>
                <p className="text-sm font-medium hidden md:block" style={{ color: 'var(--color-text-muted)' }}>
                  {loading ? 'Loading…' : `${products.length} product${products.length !== 1 ? 's' : ''} found`}
                </p>
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--color-surface)' }}>
                <button onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'opacity-50 hover:opacity-80'}`}>
                  <FiGrid size={15} style={{ color: 'var(--color-text)' }} />
                </button>
                <button onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'opacity-50 hover:opacity-80'}`}>
                  <FiList size={15} style={{ color: 'var(--color-text)' }} />
                </button>
              </div>
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.category && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700">
                    {filters.category}
                    <button onClick={() => set('category', '')}><FiX size={12} /></button>
                  </span>
                )}
                {filters.search && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700">
                    "{filters.search}"
                    <button onClick={() => set('search', '')}><FiX size={12} /></button>
                  </span>
                )}
                {(filters.minPrice > 0 || filters.maxPrice < 10000) && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700">
                    ${filters.minPrice} – ${filters.maxPrice === 10000 ? '10K+' : filters.maxPrice}
                    <button onClick={() => { set('minPrice', 0); set('maxPrice', 10000); }}><FiX size={12} /></button>
                  </span>
                )}
              </div>
            )}

            {/* Products grid */}
            {loading ? (
              <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card overflow-hidden">
                    <div className="skeleton h-52" />
                    <div className="p-4 space-y-3">
                      <div className="skeleton h-3 w-20 rounded-full" />
                      <div className="skeleton h-4 rounded" />
                      <div className="skeleton h-3 w-2/3 rounded" />
                      <div className="skeleton h-9 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20 rounded-2xl border" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                <p className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>{error}</p>
                <button onClick={resetFilters} className="btn-secondary">Try Again</button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 rounded-2xl border" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'var(--color-surface)' }}>
                  <FiPackage size={28} style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text)' }}>No products found</h3>
                <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
                  Try adjusting your filters or search term
                </p>
                <button onClick={resetFilters} className="btn-primary">Clear All Filters</button>
              </div>
            ) : (
              <div className={`grid gap-5 animate-fade-in ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {products.map((product) => (
                  <ProductCard key={product.productId} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
