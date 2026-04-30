import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const FALLBACK_SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1617627143233-95c86f4a6e1e?w=1600&q=90',
    title: 'Eid Edit 2025',
    subtitle: 'Handcrafted with love for your little ones',
    cta: 'Shop Eid Collection',
    link: '/whats-new',
    overlay: 'from-black/60 via-black/20 to-transparent',
    textSide: 'left',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1600&q=90',
    title: 'Velvet Classics',
    subtitle: 'Timeless elegance in every stitch',
    cta: 'Explore Now',
    link: '/girls',
    overlay: 'from-black/50 via-black/10 to-transparent',
    textSide: 'right',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=1600&q=90',
    title: 'New Arrivals',
    subtitle: 'Crochet & Knit Drop — Fresh styles for every season',
    cta: "Shop What's New",
    link: '/whats-new',
    overlay: 'from-rose-900/60 via-black/20 to-transparent',
    textSide: 'left',
  },
];

const mapBannerToSlide = (banner) => ({
  id: banner._id,
  image: banner.image,
  title: banner.title || 'New Collection',
  subtitle: banner.subtitle || 'Discover the latest styles',
  cta: banner.buttonText || 'Shop Now',
  link: banner.buttonLink || '/whats-new',
  overlay: 'from-black/60 via-black/20 to-transparent',
  textSide: 'left',
});

export default function HeroBanner() {
  const [slides, setSlides] = useState(FALLBACK_SLIDES);
  const [current, setCurrent] = useState(0);

  const goTo = (index) => {
    setCurrent(index);
  };

  useEffect(() => {
    api.get('/products/banners')
      .then((res) => {
        const banners = Array.isArray(res.data) ? res.data : [];
        if (banners.length > 0) {
          setSlides(banners.map(mapBannerToSlide));
          setCurrent(0);
        }
      })
      .catch(() => {
        // fallback slides remain in place
      });
  }, []);

  // ✅ Auto scroll
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const slide = slides[current];

  return (
    <div className="lg:mt-[110px] px-3"> {/* spacing for fixed navbar */}

      <div className="relative h-[85vh] min-h-[500px] max-w-7xl mx-auto overflow-hidden bg-gray-900">

        {/* Images */}
        {slides.map((s, i) => (
          <div
            key={s.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === current ? 1 : 0 }}
          >
            <img
              src={s.image}
              alt={s.title}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${s.overlay}`} />
          </div>
        ))}

        {/* Content */}
        <div className="relative h-full flex items-center">
          <div
            className={`px-10 lg:px-20 max-w-2xl ${
              slide.textSide === 'right'
                ? 'ml-auto mr-10 lg:mr-20 text-right'
                : ''
            }`}
          >
            <p className="text-rose-300 text-sm uppercase tracking-[0.3em] mb-3">
              New Collection
            </p>

            <h2 className="text-5xl lg:text-6xl text-white font-bold mb-4 leading-tight">
              {slide.title}
            </h2>

            <p className="text-white/80 text-lg mb-8">
              {slide.subtitle}
            </p>

            <Link
              to={slide.link}
              className="inline-block bg-rose-600 hover:bg-rose-700 text-white uppercase tracking-widest text-sm px-8 py-3 transition"
            >
              {slide.cta}
            </Link>
          </div>
        </div>

        {/* ✅ DOTS ONLY (no arrows) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`transition-all duration-300 rounded-full ${
                i === current
                  ? 'bg-white w-8 h-2'
                  : 'bg-white/50 w-2 h-2'
              }`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}