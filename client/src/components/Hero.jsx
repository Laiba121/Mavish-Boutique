import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function HeroBanner() {
  const navigate = useNavigate();

  // ✅ Slides State
  const [slides, setSlides] = useState([]);

  // ✅ Current Slide
  const [current, setCurrent] = useState(0);

  // ✅ Fetch banners
  useEffect(() => {
    api
      .get('/banners')
      .then((res) => {
        const banners = Array.isArray(res.data)
          ? res.data
          : [];

        if (banners.length > 0) {
          setSlides(
            banners.map((b) => ({
              id: b._id,
              image: b.image,
              link: b.buttonLink || '/whats-new',
            }))
          );
        }
      })
      .catch((err) =>
        console.log('Banner error:', err)
      );
  }, []);

  // ✅ Auto slider
  useEffect(() => {
    if (slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrent(
        (prev) => (prev + 1) % slides.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [slides]);

  // ✅ Banner click
  const handleBannerClick = () => {
    const link = slides[current]?.link;

    if (!link) return;

    // External link
    if (link.startsWith('http')) {
      window.open(link, '_blank');
    }

    // Internal route
    else {
      navigate(link);
    }
  };

  // ✅ No banners
  if (slides.length === 0) return null;

  return (
    <div className="lg:mt-[110px]">
      <div className="max-w-7xl mx-auto px-3 lg:px-10">

        <div
          className="relative h-[85vh] min-h-[500px] overflow-hidden bg-gray-900 cursor-pointer rounded-2xl"
          onClick={handleBannerClick}
        >

          {/* Slides */}
          {slides.map((s, i) => (
            <div
              key={s.id}
              className="absolute inset-0 transition-opacity duration-700"
              style={{
                opacity: i === current ? 1 : 0,
              }}
            >
              <img
                src={s.image}
                alt={`banner-${i}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">

            {slides.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent(i);
                }}
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
    </div>
  );
}