import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/api';
import { addToCart, toggleCart } from '../store/cartSlice';

const ALL_SIZES = [
  'New Born', '0-3M', '3-6M', '6-9M', '9-12M',
  '12-18M', '18-24M', '2-3Y', '3-4Y', '4-5Y',
  '5-6Y', '6-7Y', '7-8Y', '8-9Y', '9-10Y', '14-15Y',
];

const sizeChart = {
  kurta: [
    { age: 'New Born', sleeves: '7', width: '10', length: '9', armHole: '2', shoulder: '6' },
    { age: '0-2 M', sleeves: '7', width: '10.5', length: '10.5', armHole: '2.5', shoulder: '6' },
    { age: '3-6 M', sleeves: '8', width: '11', length: '12.5', armHole: '3', shoulder: '6.5' },
    { age: '6-9 M', sleeves: '9', width: '11.5', length: '12.5', armHole: '3', shoulder: '6.5' },
    { age: '9-12 M', sleeves: '10', width: '12.5', length: '13.5', armHole: '3.5', shoulder: '7' },
    { age: '1-2 Y', sleeves: '11', width: '12.5', length: '15.5', armHole: '4.5', shoulder: '9.5' },
    { age: '2-3 Y', sleeves: '12', width: '12.5', length: '16.5', armHole: '5', shoulder: '10.5' },
    { age: '3-4 Y', sleeves: '12', width: '12.5', length: '18', armHole: '5.5', shoulder: '11' },
    { age: '4-5 Y', sleeves: '13', width: '12.5', length: '20', armHole: '5.5', shoulder: '11.5' },
    { age: '5-6 Y', sleeves: '13', width: '12.5', length: '22', armHole: '5.5', shoulder: '11.5' },
    { age: '6-7 Y', sleeves: '15', width: '13.5', length: '24.5', armHole: '6', shoulder: '12.5' },
    { age: '7-8 Y', sleeves: '16', width: '14', length: '26', armHole: '6', shoulder: '12.5' },
    { age: '8-9 Y', sleeves: '17', width: '14', length: '27', armHole: '6', shoulder: '12.5' },
    { age: '9-10 Y', sleeves: '17', width: '14', length: '29', armHole: '7', shoulder: '12.5' },
    { age: '10-11 Y', sleeves: '18', width: '15', length: '30', armHole: '7', shoulder: '13' },
    { age: '11-12 Y', sleeves: '18', width: '15', length: '30', armHole: '7', shoulder: '13' },
  ],
  trouser: [
    { age: 'New Born', waist: '4.5', length: '10.5' },
    { age: '0-2 M', waist: '6', length: '11.5' },
    { age: '3-6 M', waist: '7', length: '12.5' },
    { age: '6-9 M', waist: '7', length: '13.5' },
    { age: '9-12 M', waist: '7.5', length: '14' },
    { age: '1-2 Y', waist: '7.5', length: '18.5' },
    { age: '2-3 Y', waist: '8', length: '20.5' },
    { age: '3-4 Y', waist: '9', length: '22' },
    { age: '4-5 Y', waist: '9.5', length: '24.5' },
    { age: '5-6 Y', waist: '10', length: '26.5' },
    { age: '6-7 Y', waist: '10.5', length: '28' },
    { age: '7-8 Y', waist: '11', length: '29.5' },
    { age: '8-9 Y', waist: '11.5', length: '31' },
    { age: '9-10 Y', waist: '12', length: '32.5' },
    { age: '10-11 Y', waist: '12.5', length: '34' },
    { age: '11-12 Y', waist: '13', length: '35.5' },
  ],
};

function getAvailableSizes(product) {
  if (product.availableSizes?.length) return product.availableSizes;
  if (product.variants?.length)
    return [...new Set(product.variants.map((v) => v.size).filter(Boolean))];
  return ALL_SIZES;
}

export default function ProductDetail() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('Product Details');
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [related, setRelated] = useState([]);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await api.get(`/products/${slug}`);
        setProduct(res.data);
        setCurrentImageIndex(0);
      } catch (err) {
        setError(err.response?.data?.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    const avail = getAvailableSizes(product);
    setSelectedSize(avail[0] || '');
  }, [product]);

  useEffect(() => {
    async function fetchRelated() {
      if (!product) return;
      try {
        const categoryId = product.category?._id || product.category;
        const res = categoryId
          ? await api.get(`/products?category=${categoryId}&limit=6`)
          : await api.get('/products?limit=6');
        const items = Array.isArray(res.data) ? res.data : [];
        setRelated(items.filter((i) => i._id !== product._id).slice(0, 5));
      } catch {
        /* silent */
      }
    }
    fetchRelated();
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center text-base text-gray-500">
          Loading product...
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-2 py-20 text-center">
          <p className="text-lg font-medium text-gray-800">{error || 'Product not found'}</p>
          <Link to="/" className="inline-block mt-6 bg-gray-900 text-white text-sm px-6 py-3 rounded">
            Back to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const gallery = product.images || [];
  const currentImage = gallery[currentImageIndex] || gallery[0] || '/images/logo.avif';
  const price = product.isSale && product.salePrice ? product.salePrice : product.price;
  const availableSizes = getAvailableSizes(product);
  const subtotal = price ? price * quantity : 0;

  // Sold out only if no sizes available, or all variants explicitly have zero stock
  const hasVariants = product.variants?.length > 0;
  const allVariantsSoldOut = hasVariants && product.variants.every((v) => v.stock === 0);
  const soldOut = availableSizes.length === 0 || allVariantsSoldOut;

  const handleAddToCart = () => {
    if (soldOut || !selectedSize) return;
    dispatch(addToCart({ product, size: selectedSize, quantity }));
    dispatch(toggleCart());
  };

 const handleBuyNow = () => {
  if (soldOut || !selectedSize) return;

  const buyNowItem = {
    _id: product._id,
    name: product.name,
    images: product.images,
    size: selectedSize,
    price: product.isSale && product.salePrice ? product.salePrice : product.price,
    quantity: quantity,
    isSale: product.isSale,
    salePrice: product.salePrice,
  };

  navigate('/checkout', {
    state: {
      buyNowItems: [buyNowItem],
      buyNowMode: true,
    },
  });
};

  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      {/* pt-[56px] on mobile and larger desktop padding for fixed navbar plus announcement bar */}
      <main className="max-w-7xl mx-auto px-3 lg:px-10 pt-[56px] lg:pt-[177px] pb-20">

        {/* ── Breadcrumb ── */}
        <nav className="py-4 text-sm text-gray-400 flex items-center gap-1.5 border-b border-gray-100 mb-8">
          <Link to="/" className="hover:text-gray-600 transition">Home</Link>
          <span>›</span>
          <Link to="/products" className="hover:text-gray-600 transition">Products</Link>
          <span>›</span>
          <span className="text-gray-700 font-medium">{product.name}</span>
        </nav>

        {/* ── Main product grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-14 items-start">

          {/* LEFT — Images */}
          <div>
            {/* Main image */}
            <div className="overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full object-cover object-top"
                style={{ maxHeight: '680px' }}
                onError={(e) => { e.target.src = '/images/logo.avif'; }}
              />
            </div>

            {/* Thumbnails */}
            {gallery.length > 1 && (
              <div className="mt-4 flex gap-3 flex-wrap">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`rounded-md overflow-hidden border-2 transition focus:outline-none flex-shrink-0 ${
                      currentImageIndex === idx
                        ? 'border-gray-800'
                        : 'border-gray-200 hover:border-gray-500'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      className="h-24 w-24 object-cover object-top"
                      onError={(e) => { e.target.src = '/images/logo.avif'; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — Product info */}
          <div>

            {/* Name */}
            <h1 className="text-3xl font-semibold text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mt-3 flex items-baseline gap-4">
              <span className="text-2xl font-semibold text-gray-900">
                Rs.{price?.toLocaleString()}.00
              </span>
              {product.isSale && product.salePrice && (
                <span className="text-lg text-gray-400 line-through">
                  Rs.{product.price?.toLocaleString()}.00
                </span>
              )}
            </div>

            {/* Size label */}
            <p className="mt-6 text-sm text-gray-700">
              Size: <span className="font-semibold">{selectedSize || '—'}</span>
            </p>

            {/* Size pills */}
            <div className="mt-3 flex flex-wrap gap-2">
              {ALL_SIZES.map((size) => {
                const isAvail = availableSizes.includes(size);
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    disabled={!isAvail}
                    onClick={() => isAvail && setSelectedSize(size)}
                    className={[
                      'rounded-full border text-sm font-medium px-4 py-1.5 leading-none transition',
                      !isAvail
                        ? 'border-gray-200 bg-white text-gray-300 line-through cursor-not-allowed'
                        : isSelected
                          ? 'border-gray-800 bg-gray-800 text-white'
                          : 'border-gray-400 bg-white text-gray-700 hover:border-gray-700',
                    ].join(' ')}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            {/* Size chart link */}
            <button
              type="button"
              onClick={() => setShowSizeChart(true)}
              className="mt-3 flex items-center gap-1.5 text-sm text-gray-600 underline underline-offset-2 hover:text-gray-900 transition"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="5" width="18" height="10" rx="1.5" />
                <line x1="5" y1="5" x2="5" y2="9" />
                <line x1="9" y1="5" x2="9" y2="8" />
                <line x1="13" y1="5" x2="13" y2="9" />
              </svg>
              Size Chart
            </button>

            {/* Quantity */}
            <p className="mt-6 text-sm text-gray-700">Quantity:</p>
            <div className="mt-2 inline-flex items-center border border-gray-400 rounded">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-xl border-r border-gray-300 transition"
              >
                −
              </button>
              <span className="w-12 h-11 flex items-center justify-center text-base text-gray-800 font-semibold">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-xl border-l border-gray-300 transition"
              >
                +
              </button>
            </div>

            {/* Subtotal */}
            <p className="mt-4 text-sm text-gray-700">
              Subtotal Rs.<span className="font-semibold">{subtotal?.toLocaleString()}.00</span>
            </p>

            {/* CTA buttons */}
            <div className="mt-5 flex flex-col gap-3">
              <button
                type="button"
                disabled={soldOut}
                onClick={handleAddToCart}
                className={[
                  'w-full py-4 text-sm font-semibold uppercase tracking-widest rounded transition',
                  soldOut
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-black',
                ].join(' ')}
              >
                {soldOut ? 'Sold Out' : 'Add to Cart'}
              </button>
          <button
  type="button"
  onClick={handleBuyNow}
  className="w-full py-4 text-sm font-semibold uppercase tracking-widest rounded border border-gray-800 bg-white text-gray-800 hover:bg-gray-50 transition"
>
  Buy It Now
</button>
            </div>

            {/* SKU / Tags */}
            <div className="mt-6 space-y-1.5 text-sm text-gray-500">
              <p>
                <span className="font-medium text-gray-700">SKU: </span>
                {product.sku || 'N/A'}
              </p>
              <p>
                <span className="font-medium text-gray-700">Tags: </span>
                {product.tags?.join(', ') || 'Frock'}
              </p>
            </div>

            {/* Making time */}
            <div className="mt-5 border border-red-100 bg-red-50 rounded-md px-5 py-3">
              <p className="text-sm text-red-500 font-medium text-center">
                Making Time: {product.makingTime || '3 - 4 Weeks'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mt-20 border-t border-gray-200">
          <div className="flex justify-center gap-14">
            {['Product Details', 'Care Instructions', 'Disclaimer'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={[
                  'py-5 text-sm font-medium border-b-2 -mb-px transition',
                  activeTab === tab
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-400 hover:text-gray-700',
                ].join(' ')}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-8 pb-4 text-sm text-gray-600 leading-7 max-w-3xl">
            {activeTab === 'Product Details' && (
              <div>
                <p className="mb-4">
                  {product.shortDescription ||
                    'Introducing our festive handmade collection, featuring luxury, premium, and exclusive pieces that showcase intricate craftsmanship.'}
                </p>
                <p className="mb-3 font-medium text-gray-700">This masterpiece includes:</p>
                <ul className="space-y-1.5">
                  {product.tags?.map((t) => <li key={t}>• {t}</li>) ?? <li>• Frock</li>}
                  {product.color && <li>Color: {product.color}</li>}
                  {product.fabric && <li>Fabric: {product.fabric}</li>}
                  {product.description && <li>{product.description}</li>}
                </ul>
              </div>
            )}
            {activeTab === 'Care Instructions' && (
              <ul className="space-y-1.5">
                {product.careInstructions?.length
                  ? product.careInstructions.map((l, i) => <li key={i}>• {l}</li>)
                  : (
                    <>
                      <li>• Dry clean only.</li>
                      <li>• Do not bleach.</li>
                      <li>• Iron on low heat if needed.</li>
                    </>
                  )}
              </ul>
            )}
            {activeTab === 'Disclaimer' && (
              <div className="space-y-3">
                <p>
                  {product.disclaimer ||
                    'Please note that each product is handcrafted and may vary slightly in design and color.'}
                </p>
                <p>
                  Images are for reference only. Actual product may differ due to fabric dye lots and screen settings.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <div className="mt-16 border-t border-gray-100 pt-12">
            <h2 className="text-center text-lg font-semibold text-gray-800 mb-8 tracking-wide">
              Related Products
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
              {related.map((item) => {
                const itemPrice = item.isSale && item.salePrice ? item.salePrice : item.price;
                const itemOld = item.isSale && item.salePrice ? item.price : null;
                const discount = itemOld
                  ? Math.round(((itemOld - itemPrice) / itemOld) * 100)
                  : null;
                return (
                  <Link key={item._id} to={`/product/${item.slug || item._id}`} className="group block">
                    <div className="relative overflow-hidden rounded-md bg-gray-50 aspect-[3/4]">
                      <img
                        src={item.images?.[0] || '/images/logo.avif'}
                        alt={item.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-300"
                        onError={(e) => { e.target.src = '/images/logo.avif'; }}
                      />
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {(item.isNewArrival || item.isTrending) && (
                          <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase leading-none">
                            New
                          </span>
                        )}
                        {item.isSale && discount && (
                          <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase leading-none">
                            Sale {discount}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-semibold text-gray-900 leading-snug">{item.name}</p>
                      <div className="mt-1 flex flex-wrap items-baseline gap-2">
                        <span className="text-sm text-gray-600">
                          from Rs.{itemPrice?.toLocaleString()}
                        </span>
                        {itemOld && (
                          <span className="text-xs text-gray-400 line-through">
                            Rs.{itemOld?.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {discount && (
                        <span className="inline-block mt-1.5 text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-sm">
                          -{discount}%
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ── Size Chart Modal ── */}
      {showSizeChart && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
          onClick={(e) => e.target === e.currentTarget && setShowSizeChart(false)}
        >
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Size Chart</h2>
              <button
                type="button"
                onClick={() => setShowSizeChart(false)}
                className="text-gray-400 hover:text-gray-800 text-2xl leading-none transition"
              >
                ×
              </button>
            </div>
            <div className="max-h-[75vh] overflow-y-auto px-8 py-6 space-y-10">
              {/* Kurta */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">Kurta</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left text-gray-600">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                      <tr>
                        {['Age', 'Sleeves', 'Width', 'Length', 'Arm Hole', 'Shoulder'].map((h) => (
                          <th key={h} className="px-4 py-3 font-medium border border-gray-200">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sizeChart.kurta.map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 border border-gray-100">{row.age}</td>
                          <td className="px-4 py-2 border border-gray-100">{row.sleeves}</td>
                          <td className="px-4 py-2 border border-gray-100">{row.width}</td>
                          <td className="px-4 py-2 border border-gray-100">{row.length}</td>
                          <td className="px-4 py-2 border border-gray-100">{row.armHole}</td>
                          <td className="px-4 py-2 border border-gray-100">{row.shoulder}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Trouser */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">Trouser</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left text-gray-600">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                      <tr>
                        {['Age', 'Waist', 'Length'].map((h) => (
                          <th key={h} className="px-4 py-3 font-medium border border-gray-200">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sizeChart.trouser.map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 border border-gray-100">{row.age}</td>
                          <td className="px-4 py-2 border border-gray-100">{row.waist}</td>
                          <td className="px-4 py-2 border border-gray-100">{row.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}