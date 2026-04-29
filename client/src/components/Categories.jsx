import { Link } from 'react-router-dom';

const categories = [
  {
    name: 'Girls',
    image: 'https://images.unsplash.com/photo-1617627143233-95c86f4a6e1e?w=500&q=80',
    link: '/girls',
    comingSoon: false,
  },
  {
    name: 'Women',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80',
    link: '/women',
    comingSoon: false,
  },
  {
    name: 'Boys',
    image: null,
    link: '#',
    comingSoon: true,
  },
  {
    name: 'Men',
    image: null,
    link: '#',
    comingSoon: true,
  },
];

export default function ShopByCategory() {
  return (
    <section className="py-16 px-6 lg:px-16 bg-rose-50/40">
      <h2 className="font-display text-4xl text-center mb-12 text-gray-900">Shop By Category</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            to={cat.link}
            className={`group block ${cat.comingSoon ? 'pointer-events-none' : ''}`}
          >
            <div className="relative overflow-hidden rounded-xl aspect-[3/4] bg-gray-100">
              {cat.comingSoon ? (
                <div
                  className="w-full h-full flex flex-col items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #ffe4e6 100%)',
                  }}
                >
                  <p className="font-display text-rose-400 text-lg font-semibold tracking-wide">
                    COMING
                  </p>
                  <p className="font-display text-rose-400 text-lg font-semibold tracking-wide">
                    SOON
                  </p>
                </div>
              ) : (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
            </div>
            <p className="mt-3 text-center font-body font-medium text-gray-800 group-hover:text-rose-600 transition-colors">
              {cat.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}