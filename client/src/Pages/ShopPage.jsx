import { useEffect, useState } from 'react';
import {
  useLocation,
  Link,
  useNavigate,
} from 'react-router-dom';

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
    category: 'Womens',
  },
};

const CATEGORY_ROUTE_MAP = {
  Boys: '/boys',
  Girls: '/girls',
  Men: '/men',
  Womens: '/women',
};

const isProductSoldOut = (product) => {
  const variants = product?.variants || [];

  // If backend already marks it
  if (product?.stockStatus === 'out_of_stock') return true;

  // If variants exist → check stock
  if (variants.length > 0) {
    const totalStock = variants.reduce(
      (sum, v) => sum + (Number(v.stock) || 0),
      0
    );
    return totalStock <= 0;
  }

  // If no variants → fallback to availableSizes
  if (product?.availableSizes?.length > 0) return false;

  // If nothing exists → treat as sold out
  return true;
};

export default function ShopPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const slug = location.pathname.replace(/^\//, '');
  const page = PAGE_MAP[slug] || PAGE_MAP['whats-new'];

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [categories, setCategories] = useState([]);

  const [filters, setFilters] = useState({
    selectedCategory: null,
    priceMin: 0,
    priceMax: 50000,
    stockStatus: null,
  });

  const [expandedFilters, setExpandedFilters] = useState({
    categories: true,
    availability: true,
    price: true,
  });

  // Fetch categories
  useEffect(() => {
    api
      .get('/categories')
      .then((res) => {
        setCategories(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error('Error fetching categories:', err);
      });
  }, []);

  // Reset category filter when route changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      selectedCategory: null,
    }));
  }, [page.category, page.query]);

  // Fetch products
 useEffect(() => {
  setLoading(true);
  setError('');

  const fetchProducts = async () => {
    try {
      let list = [];

      // ✅ GET COLLECTION FROM URL
      const searchParams = new URLSearchParams(location.search);
      const collection = searchParams.get('collection');

      // 1️⃣ COLLECTION FILTER (HIGHEST PRIORITY)
      if (collection) {
        const res = await api.get(
          `/products?collection=${collection}&limit=60`
        );

        list = Array.isArray(res.data) ? res.data : [];
      }

      // 2️⃣ SALE / NEW ARRIVAL
      else if (page.query) {
        const res = await api.get(
          `/products?${page.query}&limit=60`
        );

        list = Array.isArray(res.data) ? res.data : [];
      }

      // 3️⃣ CATEGORY PAGE
      else if (page.category) {
        const catRes = await api.get('/categories');

        const cats = Array.isArray(catRes.data)
          ? catRes.data
          : [];

        const matched = cats.find(
          (c) =>
            c.name.toLowerCase() ===
            page.category.toLowerCase()
        );

        if (!matched) {
          setProducts([]);
          setLoading(false);
          return;
        }

        const res = await api.get(
          `/products?category=${matched._id}&limit=60`
        );

        list = Array.isArray(res.data) ? res.data : [];
      }

      // 4️⃣ DEFAULT
      else {
        const res = await api.get('/products?limit=60');
        list = Array.isArray(res.data) ? res.data : [];
      }

      setProducts(applyFilters(list));
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  fetchProducts();
}, [location.search, page.category, page.query, filters]);

  // Apply sidebar filters
  const applyFilters = (list) => {
    return list.filter((product) => {
      if (
        filters.selectedCategory &&
        product.category?._id !==
          filters.selectedCategory
      ) {
        return false;
      }

      if (
        product.price < filters.priceMin ||
        product.price > filters.priceMax
      ) {
        return false;
      }

      if (
        filters.stockStatus &&
        product.stockStatus !==
          filters.stockStatus
      ) {
        return false;
      }

      return true;
    });
  };

  // Expand/Collapse Filters
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

            {/* Sidebar */}
            <div className="lg:col-span-1">

              {/* Categories */}
              <div className="mb-8 border-b pb-6">
                <button
                  onClick={() =>
                    toggleFilter('categories')
                  }
                  className="flex w-full items-center justify-between text-lg font-semibold uppercase tracking-wide"
                >
                  Categories

                  <span>
                    {expandedFilters.categories
                      ? '−'
                      : '+'}
                  </span>
                </button>

                {expandedFilters.categories && (
                  <div className="mt-4 space-y-3">
                    {categories.map((cat) => (
                      <label
                        key={cat._id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="category"
                          checked={
                            page.category?.toLowerCase() ===
                            cat.name.toLowerCase()
                          }
                          onChange={() => {
                            const route =
                              CATEGORY_ROUTE_MAP[
                                cat.name
                              ];

                            if (route) {
                              navigate(route);
                            } else {
                              setFilters({
                                ...filters,
                                selectedCategory:
                                  cat._id,
                              });
                            }
                          }}
                          className="w-4 h-4"
                        />

                        <span className="text-sm">
                          {cat.name}
                        </span>
                      </label>
                    ))}

                    {filters.selectedCategory && (
                      <button
                        onClick={() =>
                          setFilters({
                            ...filters,
                            selectedCategory: null,
                          })
                        }
                        className="text-sm text-gray-500 hover:text-gray-700 mt-2"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Availability */}
              <div className="mb-8 border-b pb-6">
                <button
                  onClick={() =>
                    toggleFilter('availability')
                  }
                  className="flex w-full items-center justify-between text-lg font-semibold uppercase tracking-wide"
                >
                  Availability

                  <span>
                    {expandedFilters.availability
                      ? '−'
                      : '+'}
                  </span>
                </button>

                {expandedFilters.availability && (
                  <div className="mt-4 space-y-3">

                    {/* Out of stock */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={
                          filters.stockStatus ===
                          'out_of_stock'
                        }
                        onChange={() =>
                          setFilters({
                            ...filters,
                            stockStatus:
                              filters.stockStatus ===
                              'out_of_stock'
                                ? null
                                : 'out_of_stock',
                          })
                        }
                        className="w-4 h-4"
                      />

                      <span className="text-sm">
                        Out Of Stock (
                        {
                          products.filter(
                            (p) =>
                              p.stockStatus ===
                              'out_of_stock'
                          ).length
                        }
                        )
                      </span>
                    </label>

                    {/* In stock */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={
                          filters.stockStatus ===
                          'in_stock'
                        }
                        onChange={() =>
                          setFilters({
                            ...filters,
                            stockStatus:
                              filters.stockStatus ===
                              'in_stock'
                                ? null
                                : 'in_stock',
                          })
                        }
                        className="w-4 h-4"
                      />

                      <span className="text-sm">
                        In Stock (
                        {
                          products.filter(
                            (p) =>
                              p.stockStatus ===
                              'in_stock'
                          ).length
                        }
                        )
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="mb-8">
                <button
                  onClick={() =>
                    toggleFilter('price')
                  }
                  className="flex w-full items-center justify-between text-lg font-semibold uppercase tracking-wide"
                >
                  Price

                  <span>
                    {expandedFilters.price
                      ? '−'
                      : '+'}
                  </span>
                </button>

                {expandedFilters.price && (
                  <div className="mt-4">

                    <input
                      type="range"
                      min="0"
                      max="50000"
                      value={filters.priceMin}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          priceMin: Number(
                            e.target.value
                          ),
                        })
                      }
                      className="w-full"
                    />

                    <input
                      type="range"
                      min="0"
                      max="50000"
                      value={filters.priceMax}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          priceMax: Number(
                            e.target.value
                          ),
                        })
                      }
                      className="w-full"
                    />

                    <div className="flex gap-2 mt-4">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.priceMin}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            priceMin: Number(
                              e.target.value
                            ),
                          })
                        }
                        className="flex-1 border px-2 py-1 text-sm"
                      />

                      <span className="text-sm py-1">
                        to
                      </span>

                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.priceMax}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            priceMax: Number(
                              e.target.value
                            ),
                          })
                        }
                        className="flex-1 border px-2 py-1 text-sm"
                      />
                    </div>

                    <button
                      onClick={() =>
                        setFilters({
                          ...filters,
                          priceMin: 0,
                          priceMax: 50000,
                        })
                      }
                      className="mt-4 w-full bg-[#1a1208] text-white py-2 rounded text-sm font-semibold"
                    >
                      Reset Price
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Products */}
            <div className="lg:col-span-3">

              {/* Heading */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                  {page.title}
                </h1>

                <p className="mt-2 text-gray-600">
                  {page.subtitle}
                </p>
              </div>

              {/* Loading */}
              {loading ? (
                <p className="text-center text-lg text-gray-600">
                  Loading products...
                </p>
              ) : error ? (

                /* Error */
                <p className="text-center text-lg text-red-600">
                  {error}
                </p>
              ) : !products.length ? (

                /* Empty */
                <p className="text-center text-lg text-gray-600">
                  No products found for this collection.
                </p>
              ) : (

                /* Grid */
                <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <Link
                      key={product._id}
                      to={`/product/${
                        product.slug ||
                        product._id
                      }`}
                      className="group block overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl relative"
                    >

                      {/* Sold Out */}
                     {isProductSoldOut(product) && (
  <div className="absolute top-3 left-3 bg-black text-white px-2 py-1 text-xs font-semibold rounded z-10">
    Sold Out
  </div>
)}

                      {/* Sale */}
                      {product.isSale &&
                        product.salePrice && (
                          <div className="absolute top-3 right-3 bg-rose-500 text-white px-2 py-1 text-xs font-semibold rounded z-10">
                            Sale
                          </div>
                        )}

                      {/* Image */}
                      <div className="aspect-4/5 overflow-hidden bg-gray-100">
                        <img
                          src={
                            product.images?.[0] ||
                            '/images/logo.avif'
                          }
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h2 className="text-lg font-semibold text-gray-900">
                          {product.name}
                        </h2>

                        <div className="mt-3 flex items-center gap-2 flex-wrap">

                          {product.isSale &&
                          product.salePrice &&
                          product.salePrice <
                            product.price ? (
                            <>
                              <span className="text-sm font-semibold text-rose-600">
                                Rs.
                                {product.salePrice?.toLocaleString()}
                              </span>

                              <span className="text-sm text-gray-400 line-through">
                                Rs.
                                {product.price?.toLocaleString()}
                              </span>

                              <span className="text-xs bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded font-medium">
                                {Math.round(
                                  ((product.price -
                                    product.salePrice) /
                                    product.price) *
                                    100
                                )}
                                % off
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">
                              from Rs.
                              {product.price?.toLocaleString()}
                            </span>
                          )}

                        </div>
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