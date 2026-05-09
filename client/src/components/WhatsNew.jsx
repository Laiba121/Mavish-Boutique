import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../utils/api.js';

const getVisibleCount = () => {
  if (typeof window === 'undefined') return 5;

  if (window.innerWidth >= 1024) return 5;
  if (window.innerWidth >= 768) return 4;
  if (window.innerWidth >= 520) return 3;

  return 2;
};

const AUTO_SCROLL_INTERVAL = 3000;

export default function WhatsNew() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(getVisibleCount);

  const timerRef = useRef(null);

  // ✅ Fetch Dynamic Products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get(
          '/products?newArrival=true&limit=20'
        );

        const products = Array.isArray(res.data)
          ? res.data
          : [];

        if (products.length === 0) {
          setCollections([]);
          return;
        }

        const seen = new Set();

       const dynamicCollections = products
  .filter((p) => {
    const collectionName =
      p.productCollection;

    // ✅ skip empty collections
    if (
      !collectionName ||
      seen.has(collectionName)
    ) {
      return false;
    }

    seen.add(collectionName);
    return true;
  })
  .map((p) => ({
    // ✅ SHOW COLLECTION NAME
    name: p.productCollection,

    image: p.images?.[0] || '',

    // ✅ redirect to category page
    link: `/category/${
      p.category?._id || p.category
    }`,
  }));

        setCollections(dynamicCollections);
      } catch (error) {
        console.error(
          'Error fetching new arrivals:',
          error
        );

        setCollections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ✅ Responsive Items Count
  useEffect(() => {
    const handleResize = () => {
      setVisible(getVisibleCount());
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () =>
      window.removeEventListener(
        'resize',
        handleResize
      );
  }, []);

  const gap = visible >= 4 ? 16 : 12;

  const maxIndex = Math.max(
    0,
    collections.length - visible
  );

  const goNext = useCallback(() => {
    setCurrent((c) =>
      c >= maxIndex ? 0 : c + 1
    );
  }, [maxIndex]);

  const goPrev = useCallback(() => {
    setCurrent((c) =>
      c <= 0 ? maxIndex : c - 1
    );
  }, [maxIndex]);

  // ✅ Auto Scroll
  const startAutoScroll = useCallback(() => {
    clearInterval(timerRef.current);

    timerRef.current = setInterval(
      goNext,
      AUTO_SCROLL_INTERVAL
    );
  }, [goNext]);

  useEffect(() => {
    if (collections.length > visible) {
      startAutoScroll();
    }

    return () =>
      clearInterval(timerRef.current);
  }, [
    collections.length,
    visible,
    startAutoScroll,
  ]);

  const handlePrev = () => {
    goPrev();
    startAutoScroll();
  };

  const handleNext = () => {
    goNext();
    startAutoScroll();
  };

  const safeCurrent = Math.min(
    current,
    maxIndex
  );

  const itemWidthCalc = `calc((100% - ${
    (visible - 1) * gap
  }px) / ${visible})`;

  const translateX = `calc(-${safeCurrent} * ((100% - ${
    (visible - 1) * gap
  }px) / ${visible} + ${gap}px))`;

  // ✅ Loading
  if (loading) {
    return (
      <section className="py-16 text-center">
        <p className="text-gray-500">
          Loading products...
        </p>
      </section>
    );
  }

  // ✅ No Products Found
  if (collections.length === 0) {
    return (
      <section className="py-16 text-center">
        <h2 className="font-display text-4xl mb-6 text-gray-900">
          What's New
        </h2>

        <p className="text-gray-500 text-lg">
          No products found.
        </p>
      </section>
    );
  }

  return (
    <section className="py-16">
      <h2 className="font-display text-4xl text-center mb-12 text-gray-900">
        What's New
      </h2>

      <div
        className="relative"
        onMouseEnter={() =>
          clearInterval(timerRef.current)
        }
        onMouseLeave={startAutoScroll}
      >
        {/* Prev Button */}
        {collections.length > visible && (
          <button
            onClick={handlePrev}
            aria-label="Previous new collections"
            className="absolute left-0 top-1/2 -translate-y-[60%] z-10 bg-black text-white rounded-lg p-2 shadow-md hover:bg-gray-800 transition-all"
          >
            <ChevronLeft size={25} />
          </button>
        )}

        {/* Slider */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{
              gap: `${gap}px`,
              transform: `translateX(${translateX})`,
            }}
          >
            {collections.map((col, i) => (
              <Link
                key={i}
                to={col.link}
                className="group block flex-shrink-0"
                style={{ width: itemWidthCalc }}
              >
                <div className="overflow-hidden rounded-2xl aspect-[3/4] bg-gray-100">
                  <img
                    src={col.image}
                    alt={col.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <p className="mt-3 text-sm font-semibold text-center text-gray-800 group-hover:underline group-hover:text-rose-600 transition-colors">
                  {col.name}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Next Button */}
        {collections.length > visible && (
          <button
            onClick={handleNext}
            aria-label="Next new collections"
            className="absolute right-0 top-1/2 -translate-y-[60%] z-10 bg-black text-white rounded-lg p-2 shadow-md hover:bg-gray-800 transition-all"
          >
            <ChevronRight size={25} />
          </button>
        )}
      </div>
    </section>
  );
}