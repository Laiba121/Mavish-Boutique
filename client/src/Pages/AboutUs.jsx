import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AboutUs() {
  return (
    <>
      <Navbar />

      <main className="pt-[110px] pb-12 bg-white">
        <section className="mx-auto max-w-7xl px-6 sm:px-8 pt-[25px] lg:pt-[100px]">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-10 shadow-sm">
            <h1 className="font-display text-[34px] font-black leading-tight text-black sm:text-[44px]">
              About Us
            </h1>

            <div className="mt-6 space-y-4 text-[15px] leading-7 text-gray-800">
              <p>
                <span className="font-bold text-black">Welcome to Mavish!</span>
              </p>

              <p>
                We specialize in elegant and stylish mother-daughter outfits and kidswear
                designed with love and care. Our goal is to bring tradition and modern fashion
                together, offering high-quality fabrics, unique designs, and beautiful detailing.
              </p>

              <p>
                Each outfit is crafted to make your little moments special—whether it’s Eid,
                weddings, or casual wear. We believe in comfort, quality, and style for both
                moms and their little ones.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

