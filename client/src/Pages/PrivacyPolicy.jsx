import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PrivacyPolicy() {
  return (
    <>
      <Navbar />

      <main className="pt-[110px] pb-12 bg-white">
        <section className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-10 shadow-sm">
            <h1 className="font-display text-[34px] font-black leading-tight text-black sm:text-[44px]">
              Privacy Policy
            </h1>

            <div className="mt-6 space-y-5 text-[15px] leading-7 text-gray-800">
              <p>
                <span className="font-bold text-black">📜 Policies (Important)</span>
              </p>

              <div className="space-y-4">
                <div>
                  <p className="font-bold text-black">1. Order Policy</p>
                  <p>
                    All orders are confirmed after advance payment. We start preparing
                    your order once payment is received.
                  </p>
                </div>

                <div>
                  <p className="font-bold text-black">2. Payment Policy</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>50% advance payment required</li>
                    <li>
                      Remaining payment before delivery / Cash on Delivery (optional, agar
                      rakhna chaho)
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="font-bold text-black">3. Delivery Policy</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Delivery time: 15–20 working days</li>
                    <li>
                      Delays may happen during busy seasons (Eid, weddings)
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="font-bold text-black">4. Exchange Policy</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Exchange available within 2–3 days</li>
                    <li>Only in case of size issue or damaged item</li>
                    <li>Item must be unused with tags</li>
                  </ul>
                </div>

                <div>
                  <p className="font-bold text-black">5. No Refund Policy</p>
                  <p>
                    We do not offer refunds, only exchanges (clear likhna important hota
                    hai)
                  </p>
                </div>

                <div>
                  <p className="font-bold text-black">6. Custom Orders</p>
                  <p>
                    Custom stitching/orders are non-refundable and require full advance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

