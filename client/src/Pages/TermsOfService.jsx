import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function TermsOfService() {
  return (
    <>
      <Navbar />

      <main className="pt-[110px] pb-12 bg-white">
        <section className="mx-auto max-w-7xl px-6 sm:px-8 pt-[25px] lg:pt-[100px]">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-10 shadow-sm">
            <h1 className="font-display text-[34px] font-black leading-tight text-black sm:text-[44px]">
              Terms Of Service
            </h1>

            <div className="mt-6 space-y-4 text-[15px] leading-7 text-gray-800">
              <p>
                <span className="font-bold text-black">✨ MAVISH – Terms & Policies ✨</span>
              </p>

              <p>
                At Mavish, we focus on quality, elegance &amp; customer satisfaction 🤍
              </p>

              <div className="space-y-5">
                <div>
                  <p className="font-bold text-black">📜 Order Policy</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>All orders are confirmed after payment</li>
                    <li>No cancellation once order is placed</li>
                    <li>Made-to-order articles may take extra time</li>
                  </ul>
                </div>

                <div>
                  <p className="font-bold text-black">💳 Payment</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Advance or full payment required</li>
                    <li>Payments via Bank Transfer / EasyPaisa / JazzCash</li>
                    <li>Advance is non-refundable</li>
                  </ul>
                </div>

                <div>
                  <p className="font-bold text-black">🚚 Delivery</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Nationwide delivery available</li>
                    <li>5–10 working days delivery time</li>
                    <li>Courier delays are not our responsibility</li>
                  </ul>
                </div>

                <div>
                  <p className="font-bold text-black">🔁 Exchange Policy</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Exchange only for defective/wrong items</li>
                    <li>Request within 48 hours with proof</li>
                    <li>No return/exchange on customized orders</li>
                  </ul>
                </div>

                <div>
                  <p className="font-bold text-black">📏 Sizing</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Please follow size chart carefully</li>
                    <li>Custom sizes are non-exchangeable</li>
                  </ul>
                </div>

                <div>
                  <p className="font-bold text-black">⚠️ Note</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Slight color or design variation may occur</li>
                    <li>Handmade details may vary slightly</li>
                  </ul>
                </div>
              </div>

              <p>
                <span className="font-bold text-black">Thank you for trusting Mavish 🤍</span>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

