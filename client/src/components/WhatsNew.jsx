import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../utils/api.js';

const FALLBACK_COLLECTIONS = [
  { name: 'Crochet & Knit Drop.', highlight: false, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80', link: '/whats-new' },
  { name: 'Velvet Classics', highlight: false, image: 'https://images.unsplash.com/photo-1571513722275-4b41940f54b8?w=600&q=80', link: '/girls' },
  { name: 'Eid Sale', highlight: true, image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&q=80', link: '/sale' },
  { name: 'B.Pair Clearance', highlight: false, image: 'https://images.unsplash.com/photo-1591363079512-50f5cbe1f1be?w=600&q=80', link: '/whats-new' },
  { name: 'Eid Edit', highlight: false, image: 'https://images.unsplash.com/photo-1617627143233-95c86f4a6e1e?w=600&q=80', link: '/girls' },
{ name: 'Eid Sale', highlight: true, image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&q=80', link: '/sale' },
  { name: 'B.Pair Clearance', highlight: false, image: 'https://images.unsplash.com/photo-1591363079512-50f5cbe1f1be?w=600&q=80', link: '/whats-new' },
  { name: 'Eid Edit', highlight: false, image: 'https://images.unsplash.com/photo-1617627143233-95c86f4a6e1e?w=600&q=80', link: '/girls' },
];

const getVisibleCount = () => {
  if (typeof window === 'undefined') return 5;
  if (window.innerWidth >= 1024) return 5;
  if (window.innerWidth >= 768) return 4;
  if (window.innerWidth >= 520) return 3;
  return 2;
};

const AUTO_SCROLL_INTERVAL = 3000;

export default function WhatsNew() {
  const [collections, setCollections] = useState(FALLBACK_COLLECTIONS);
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(getVisibleCount);
  const timerRef = useRef(null);

  useEffect(() => {
    api.get('/products?newArrival=true&limit=8')
      .then(res => {
        if (res.data.length > 0) {
          const map = {};
          res.data.forEach(p => {
            if (p.collection && !map[p.collection]) {
              map[p.collection] = {
                name: p.collection,
                highlight: false,
                image: p.images?.[0] || '',
                link: p.category === 'Girls' ? '/girls' : '/whats-new',
              };
            }
          });
          const cols = Object.values(map);
          if (cols.length > 0) setCollections(cols);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleResize = () => setVisible(getVisibleCount());

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const gap = visible >= 4 ? 16 : 12;
  const maxIndex = Math.max(0, collections.length - visible);

  const goNext = useCallback(() => {
    setCurrent(c => (c >= maxIndex ? 0 : c + 1));
  }, [maxIndex]);

  const goPrev = useCallback(() => {
    setCurrent(c => (c <= 0 ? maxIndex : c - 1));
  }, [maxIndex]);

  const startAutoScroll = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(goNext, AUTO_SCROLL_INTERVAL);
  }, [goNext]);

  useEffect(() => {
    startAutoScroll();
    return () => clearInterval(timerRef.current);
  }, [collections.length, startAutoScroll]);

  const handlePrev = () => { goPrev(); startAutoScroll(); };
  const handleNext = () => { goNext(); startAutoScroll(); };

  const safeCurrent = Math.min(current, maxIndex);
  const itemWidthCalc = `calc((100% - ${(visible - 1) * gap}px) / ${visible})`;
  const translateX = `calc(-${safeCurrent} * ((100% - ${(visible - 1) * gap}px) / ${visible} + ${gap}px))`;

  return (
    <section className="py-16">
      <h2 className="font-display text-4xl text-center mb-12 text-gray-900">What's New</h2>

      <div
        className="relative"
        onMouseEnter={() => clearInterval(timerRef.current)}
        onMouseLeave={startAutoScroll}
      >
        {/* Prev */}
        <button
          onClick={handlePrev}
          aria-label="Previous new collections"
          className="absolute left-0 top-1/2 -translate-y-[60%] z-10 bg-black text-white rounded-lg p-2 shadow-md hover:bg-gray-800 transition-all"
        >
          <ChevronLeft size={25} />
        </button>

        {/* Track */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ gap: `${gap}px`, transform: `translateX(${translateX})` }}
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
                <p className={`mt-3 text-sm font-semibold text-center transition-colors ${
                  col.highlight
                    ? 'text-[#5b7fa6] group-hover:underline'
                    : 'text-gray-800 group-hover:underline group-hover:text-rose-600'
                }`}>
                  {col.name}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Next */}
        <button
          onClick={handleNext}
          aria-label="Next new collections"
          className="absolute right-0 top-1/2 -translate-y-[60%] z-10 bg-black text-white rounded-lg p-2 shadow-md hover:bg-gray-800 transition-all"
        >
          <ChevronRight size={25} />
        </button>
      </div>
    </section>
  );
}
