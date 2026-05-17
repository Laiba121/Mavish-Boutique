import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../utils/api.js';

function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false);

  const mainImg = product.images?.[0] || '';
  const hoverImg =
    product.hoverImage || product.images?.[1] || mainImg;

const variants = product?.variants || [];

// total stock from variants
const totalStock = variants.reduce(
  (sum, v) => sum + (Number(v.stock) || 0),
  0
);

// fallback size array (if you use availableSizes too)
const sizes = product?.availableSizes || [];

// FINAL SOLD OUT LOGIC (correct)
const isSoldOut =
  (variants.length > 0 && totalStock === 0) ||
  (variants.length === 0 && sizes.length === 0);

  return (
    <Link
      to={`/product/${product.slug || product._id}`}
      className="group block flex-shrink-0 w-[85vw] sm:w-[60vw] md:w-[calc((100%-74px)/3)] lg:w-[calc((100%-111px)/4)]"
    >
      <div
        className="relative h-[360px] overflow-hidden bg-gray-100 md:h-[430px]"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <img
          src={mainImg}
          alt={product.name}
          className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-400 ${
            isSoldOut ? 'opacity-70' : ''
          }`}
          style={{ opacity: hovered ? 0 : 1 }}
        />

        <img
          src={hoverImg}
          alt={product.name}
          className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-400 ${
            isSoldOut ? 'opacity-70' : ''
          }`}
          style={{ opacity: hovered ? 1 : 0 }}
        />

        {product.isSale && (
          <span className="absolute top-3 left-3 z-10 bg-rose-600 text-white text-xs px-2 py-1 font-body uppercase tracking-wide">
            Sale
          </span>
        )}

        {isSoldOut && (
          <span className="absolute top-3 right-3 z-10 bg-black text-white text-xs px-3 py-1 font-body uppercase tracking-wide">
            Sold Out
          </span>
        )}
      </div>

      <div className="mt-5">
        <h3 className="font-body text-[18px] font-semibold leading-tight tracking-[0.01em] text-black group-hover:text-rose-600 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-4 mt-4">
          {product.isSale && product.salePrice ? (
            <>
              <span className="text-rose-600 font-bold text-[17px] leading-none">
                Rs.{product.salePrice.toLocaleString()}
              </span>

              <span className="text-gray-400 text-sm line-through">
                Rs.{product.price.toLocaleString()}
              </span>
            </>
          ) : (
            <>
              <span className="text-[16px] leading-none text-neutral-500">
                from
              </span>

              <span className="text-[17px] font-bold leading-none text-neutral-800">
                Rs.{product.price.toLocaleString()}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function Trending() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef(null);

  const scroll = direction => {
    const row = scrollRef.current;

    if (!row) return;

    const card = row.querySelector('a');

    const gap = parseFloat(
      getComputedStyle(row).columnGap || 0
    );

    const amount = card
      ? card.getBoundingClientRect().width + gap
      : 500;

    row.scrollBy({
      left: direction * amount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    api
      .get('/products?trending=true&limit=8')
      .then(res => {
        const data = res.data;

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
          ? data.products
          : [];

        setProducts(list);
      })
      .catch(err => {
        console.error('Failed to fetch trending products:', err);
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <section className="bg-white px-5 pt-6 pb-14 md:px-8 md:pt-7 md:pb-12 lg:px-12">
      <h2 className="font-display text-[38px] font-bold leading-none text-center mb-[124px] text-black">
        Trending
      </h2>

      {loading ? (
        <div className="text-center py-20 text-gray-500 font-body">
          Loading products...
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-500 font-body text-lg">
          No products found
        </div>
      ) : (
        <div className="relative px-6 lg:px-14 mx-auto max-w-7xl">
          <button
            onClick={() => scroll(-1)}
            aria-label="Previous trending products"
            className="absolute left-[20px] top-[180px] z-10 flex p-3 -translate-y-1/2 items-center justify-center rounded-md bg-black text-white shadow-md transition-colors hover:bg-neutral-800 md:top-[215px]"
          >
            <ChevronLeft size={28} strokeWidth={1} />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-[37px] overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {products.map(product => (
              <ProductCard
                key={product._id}
                product={product}
              />
            ))}
          </div>

          <button
            onClick={() => scroll(1)}
            aria-label="Next trending products"
            className="absolute right-[20px] top-[180px] z-10 flex p-3 -translate-y-1/2 items-center justify-center rounded-md bg-black text-white shadow-md transition-colors hover:bg-neutral-800 md:top-[215px]"
          >
            <ChevronRight size={28} strokeWidth={1} />
          </button>
        </div>
      )}
    </section>
  );
}