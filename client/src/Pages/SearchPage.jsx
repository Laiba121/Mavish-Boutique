import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../utils/api';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchPage() {
  const query = useQuery();
  const searchTerm = query.get('q')?.trim() || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!searchTerm) {
      setProducts([]);
      return;
    }

    setLoading(true);
    setError('');

    api.get('/products?limit=80')
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        const normalized = searchTerm.toLowerCase();
        const filtered = list.filter((product) => {
          return (
            product.name?.toLowerCase().includes(normalized) ||
            product.productCollection?.toLowerCase().includes(normalized) ||
            product.category?.name?.toLowerCase().includes(normalized) ||
            product.subCategory?.name?.toLowerCase().includes(normalized)
          );
        });
        setProducts(filtered);
      })
      .catch(() => setError('Unable to load search results.'))
      .finally(() => setLoading(false));
  }, [searchTerm]);

  return (
    <main className="bg-white pt-30 text-black">
      <section className="bg-black text-white py-24">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-rose-300 mb-4">Search</p>
          <h1 className="text-5xl font-bold tracking-tight mb-4">Search results</h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/80">
            Showing results for <span className="font-semibold">{searchTerm || '...'}</span>.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        {loading ? (
          <p className="text-center text-lg text-gray-600">Searching products...</p>
        ) : error ? (
          <p className="text-center text-lg text-red-600">{error}</p>
        ) : !searchTerm ? (
          <p className="text-center text-lg text-gray-600">Enter a search term to see products.</p>
        ) : !products.length ? (
          <p className="text-center text-lg text-gray-600">No products matched your search.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product._id}
                to={`/product/${product.slug || product._id}`}
                className="group block overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
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
      </section>
    </main>
  );
}
