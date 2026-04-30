import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/api';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await api.get(`/products/${id}`);
        const data = res.data;
        setProduct(data);
        setSelectedImage(data.images?.[0] || data.galleryImages?.[0] || '');
      } catch (err) {
        console.error('Unable to load product:', err);
        setError(err.response?.data?.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-600">Loading product...</div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <p className="text-xl font-semibold text-gray-800">{error || 'Product not found'}</p>
          <Link to="/" className="inline-block mt-6 bg-[#1a1208] text-white px-6 py-3 rounded">
            Back to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const gallery = product.galleryImages?.length ? product.galleryImages : product.images || [];
  const price = product.isSale && product.salePrice ? product.salePrice : product.price;

  return (
    <div className="bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-10 lg:px-8 lg:py-14">
        <div className="mb-6 text-sm text-gray-500">
          <Link to="/" className="hover:text-black">Home</Link>
          <span className="px-2">/</span>
          <Link to="/" className="hover:text-black">Products</Link>
          <span className="px-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-start">
          <section>
            <div className="rounded-3xl overflow-hidden border border-gray-200 bg-gray-100">
              <img
                src={selectedImage || gallery[0] || '/images/logo.avif'}
                alt={product.name}
                className="w-full object-cover"
                style={{ height: 520 }}
              />
            </div>

            {gallery.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {gallery.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`rounded-3xl overflow-hidden border ${selectedImage === img ? 'border-black' : 'border-gray-200'}`}
                  >
                    <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-24 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-6">
            <div className="flex flex-col gap-3">
              {product.isSale && (
                <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-sm font-medium text-rose-700">
                  Sale
                </span>
              )}
              {product.isTrending && (
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                  Trending
                </span>
              )}
              {product.isNewArrival && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                  New Arrival
                </span>
              )}
            </div>

            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-gray-950">{product.name}</h1>
              <p className="mt-3 text-lg text-gray-600">{product.shortDescription || product.description}</p>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-gray-900">Rs.{price?.toLocaleString()}</div>
                {product.isSale && product.salePrice && (
                  <span className="text-gray-500 line-through">Rs.{product.price?.toLocaleString()}</span>
                )}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Category</p>
                  <p className="mt-2 text-sm text-gray-900">{product.category?.name || 'Uncategorized'}</p>
                </div>
                <div className="rounded-3xl bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Collection</p>
                  <p className="mt-2 text-sm text-gray-900">{product.productCollection || 'Standard'}</p>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button className="flex-1 rounded-3xl bg-black px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-gray-900">
                  Buy Now
                </button>
                <button className="flex-1 rounded-3xl border border-black px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-gray-100">
                  Add to Wishlist
                </button>
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-gray-900">Product Details</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
