import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/api';

const PAGE_MAP = {
  sale: {
    title: 'Sale',
    subtitle: 'Limited-time offers on select styles.',
    query: 'sale=true',
  },
  'whats-new': {
    title: "What's New",
    subtitle: 'Fresh arrivals for every celebration.',
    query: 'newArrival=true',
  },
  boys: {
    title: 'Boys',
    subtitle: 'Smart festive wear for boys.',
    category: 'Boys',
  },
  girls: {
    title: 'Girls',
    subtitle: 'Pretty new pieces for girls.',
    category: 'Girls',
  },
  men: {
    title: 'Men',
    subtitle: 'Modern festive outfits for men.',
    category: 'Men',
  },
  women: {
    title: 'Women',
    subtitle: 'Timeless silhouettes for women.',
    category: 'Women',
  },
};

export default function ShopPage() {
  const location = useLocation();
  const slug = location.pathname.replace(/^\//, '');
  const page = PAGE_MAP[slug] || PAGE_MAP['whats-new'];
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    selectedCategory: null,
    priceMin: 0,
    priceMax: 9395,
    stockStatus: null, // 'in_stock' or 'out_of_stock'
  });
  const [expandedFilters, setExpandedFilters] = useState({
    categories: true,
    availability: true,
    price: true,
  });

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/products/categories');
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');

    const fetchProducts = async () => {
      try {
        // For fixed routes (like /girls, /boys, /sale, /whats-new), fetch without category filter
        // and filter client-side
        const query = page.query ? `?${page.query}&limit=60` : '?limit=60';
        const res = await api.get(`/products${query}`);
        const list = Array.isArray(res.data) ? res.data : [];
        
        // Filter by category name client-side if needed
        let filtered = page.category
          ? list.filter((item) => item.category?.name?.toLowerCase() === page.category.toLowerCase())
          : list;

        // Apply additional filters
        filtered = applyFilters(filtered);
        setProducts(filtered);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page.category, page.query, filters]);

  const applyFilters = (list) => {
    return list.filter((product) => {
      // Filter by selected category
      if (filters.selectedCategory && product.category?._id !== filters.selectedCategory) {
        return false;
      }
      // Filter by price range
      if (product.price < filters.priceMin || product.price > filters.priceMax) {
        return false;
      }
      // Filter by stock status
      if (filters.stockStatus && product.stockStatus !== filters.stockStatus) {
        return false;
      }
      return true;
    });
  };

  const displayTitle = page.title;
  const displaySubtitle = page.subtitle;

  const toggleFilter = (filter) => {
    setExpandedFilters((prev) => ({
      ...prev,
      [filter]: !prev[filter],
    }));
  };






  return (
    <>
      <Navbar />
      <main className="bg-white pt-30 text-black min-h-screen">
        <section className="mx-auto max-w-7xl px-5 py-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              {/* Categories Filter */}
              <div className="mb-8 border-b pb-6">
                <button
                  onClick={() => toggleFilter('categories')}
                  className="flex w-full items-center justify-between text-lg font-semibold uppercase tracking-wide"
                >
                  Categories
                  <span>{expandedFilters.categories ? '−' : '+'}</span>
                </button>
                {expandedFilters.categories && (
                  <div className="mt-4 space-y-3">
                    {categories.map((cat) => (
                      <label key={cat._id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          checked={filters.selectedCategory === cat._id}
                          onChange={() => setFilters({ ...filters, selectedCategory: cat._id })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{cat.name}</span>
                      </label>
                    ))}
                    {filters.selectedCategory && (
                      <button
                        onClick={() => setFilters({ ...filters, selectedCategory: null })}
                        className="text-sm text-gray-500 hover:text-gray-700 mt-2"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Availability Filter */}
              <div className="mb-8 border-b pb-6">
                <button
                  onClick={() => toggleFilter('availability')}
                  className="flex w-full items-center justify-between text-lg font-semibold uppercase tracking-wide"
                >
                  Availability
                  <span>{expandedFilters.availability ? '−' : '+'}</span>
                </button>
                {expandedFilters.availability && (
                  <div className="mt-4 space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.stockStatus === 'out_of_stock'}
                        onChange={() =>
                          setFilters({
                            ...filters,
                            stockStatus: filters.stockStatus === 'out_of_stock' ? null : 'out_of_stock',
                          })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Out Of Stock({products.filter(p => p.stockStatus === 'out_of_stock').length})</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.stockStatus === 'in_stock'}
                        onChange={() =>
                          setFilters({
                            ...filters,
                            stockStatus: filters.stockStatus === 'in_stock' ? null : 'in_stock',
                          })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm">In Stock({products.filter(p => p.stockStatus === 'in_stock').length})</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Price Filter */}
              <div className="mb-8">
                <button
                  onClick={() => toggleFilter('price')}
                  className="flex w-full items-center justify-between text-lg font-semibold uppercase tracking-wide"
                >
                  Price
                  <span>{expandedFilters.price ? '−' : '+'}</span>
                </button>
                {expandedFilters.price && (
                  <div className="mt-4">
                    <input
                      type="range"
                      min="0"
                      max="50000"
                      value={filters.priceMin}
                      onChange={(e) => setFilters({ ...filters, priceMin: Number(e.target.value) })}
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max="50000"
                      value={filters.priceMax}
                      onChange={(e) => setFilters({ ...filters, priceMax: Number(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex gap-2 mt-4">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.priceMin}
                        onChange={(e) => setFilters({ ...filters, priceMin: Number(e.target.value) })}
                        className="flex-1 border px-2 py-1 text-sm"
                      />
                      <span className="text-sm py-1">to</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.priceMax}
                        onChange={(e) => setFilters({ ...filters, priceMax: Number(e.target.value) })}
                        className="flex-1 border px-2 py-1 text-sm"
                      />
                    </div>
                    <button
                      onClick={() => setFilters({ ...filters, priceMin: 0, priceMax: 9395 })}
                      className="mt-4 w-full bg-[#1a1208] text-white py-2 rounded text-sm font-semibold"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{displayTitle}</h1>
                <p className="mt-2 text-gray-600">{displaySubtitle}</p>
              </div>

              {loading ? (
                <p className="text-center text-lg text-gray-600">Loading products...</p>
              ) : error ? (
                <p className="text-center text-lg text-red-600">{error}</p>
              ) : !products.length ? (
                <p className="text-center text-lg text-gray-600">No products found for this collection.</p>
              ) : (
                <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <Link
                      key={product._id}
                      to={`/product/${product.slug || product._id}`}
                      className="group block overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl relative"
                    >
                      {product.stockStatus === 'out_of_stock' && (
                        <div className="absolute top-3 left-3 bg-white text-black px-2 py-1 text-xs font-semibold rounded z-10">
                          Sold Out
                        </div>
                      )}
                      <div className="aspect-4/5 overflow-hidden bg-gray-100">
                        <img
                          src={product.images?.[0] || '/images/logo.avif'}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-5">
                        <h2 className="text-lg font-semibold text-gray-900">{product.name}</h2>
                        <p className="mt-3 text-sm text-gray-500">from Rs.{product.price?.toLocaleString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
