import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const FALLBACK_SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1617627143233-95c86f4a6e1e?w=1600&q=90',
    link: '/whats-new'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1600&q=90',
    link: '/girls'
  }
];

export default function HeroBanner() {
  const [slides, setSlides] = useState(FALLBACK_SLIDES);
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  // ✅ FIXED: use PUBLIC API
  useEffect(() => {
    api.get('/banners')
      .then((res) => {
        const banners = Array.isArray(res.data) ? res.data : [];

        if (banners.length > 0) {
          setSlides(
            banners.map((b) => ({
              id: b._id,
              image: b.image,
              link: b.buttonLink || '/whats-new'
            }))
          );
        }
      })
      .catch((err) => console.log('Banner error:', err));
  }, []);

  // ✅ FIXED interval (no dependency bug)
  useEffect(() => {
    if (slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides]);

  const handleBannerClick = () => {
    const link = slides[current]?.link;
    if (!link) return;

    if (link.startsWith('http')) {
      window.open(link, '_blank');
    } else {
      navigate(link);
    }
  };

  return (
    <div className="lg:mt-[110px]">
      <div className="max-w-7xl mx-auto px-3 lg:px-10">
        <div
          className="relative h-[85vh] min-h-[500px] overflow-hidden bg-gray-900 cursor-pointer"
          onClick={handleBannerClick}
        >
          {slides.map((s, i) => (
            <div
              key={s.id}
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: i === current ? 1 : 0 }}
            >
              <img
                src={s.image}
                alt="banner"
                className="w-full h-full object-cover"
              />
            </div>
          ))}

          {/* dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent(i);
                }}
                className={`transition-all duration-300 rounded-full ${
                  i === current ? 'bg-white w-8 h-2' : 'bg-white/50 w-2 h-2'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}