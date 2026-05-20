import { Link } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';

export default function CustomizedOrdersSection() {
  return (
    <section className="bg-rose-50/40 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-5 lg:px-10">

        <div className="grid lg:grid-cols-2 overflow-hidden rounded-[26px] bg-[#2b2118] min-h-[420px]">

          {/* Left Image ONLY */}
          <div className="relative h-[320px] sm:h-[380px] lg:h-auto">

            <img
              src="/images/customized1.webp"
              alt="Customized Orders"
              className="absolute inset-0 w-full h-full object-cover"
            />

          </div>

          {/* Right Content */}
          <div className="flex flex-col justify-center px-7 py-10 sm:px-10 lg:px-14 text-white">

            <p className="uppercase tracking-[4px] text-[11px] text-[#d2c3b2] mb-4">
              Custom Atelier
            </p>

            <h2 className="text-3xl sm:text-4xl leading-tight font-light">
              Create Your
              <span className="block mt-1 font-semibold">
                Dream Outfit
              </span>
            </h2>

            <div className="w-16 h-[1px] bg-[#b89d7a] my-6" />

            <p className="text-[#d8d0c8] text-sm leading-7 max-w-lg">
              Personalized outfits for weddings, festive wear,
              luxury pret, and bridal collections crafted to
              your measurements and style preferences.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-5 mt-8 text-[13px] text-[#e7dfd5]">

              <div>Custom Measurements</div>
              <div>Luxury Handwork</div>

              <div>Premium Fabrics</div>
              <div>Nationwide Delivery</div>

            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 mt-10">

              {/* WhatsApp */}
              <a
                href="https://wa.me/923001112233"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-rose-200 hover:bg-white text-black transition-all duration-300 px-7 py-3 rounded-full flex items-center gap-2 text-sm tracking-wide font-medium"
              >
                <FaWhatsapp size={18} />
                WhatsApp Us
              </a>

              {/* Contact */}
              <Link
                to="/contact"
                className="border border-white/20 hover:bg-rose-200 hover:text-black transition-all duration-300 px-7 py-3 rounded-full text-sm tracking-wide font-medium"
              >
                Contact Us
              </Link>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
}