import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ReturnAndExchange() {
  return (
    <>
      <Navbar />

      <main className="pt-[110px] pb-12 bg-white">
        <section className="mx-auto max-w-7xl px-6 sm:px-8 pt-[25px] lg:pt-[100px]">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-10 shadow-sm">
            <h1 className="font-display text-[34px] font-black leading-tight text-black sm:text-[44px]">
              Return & Exchange
            </h1>

            <p className="mt-4 max-w-3xl text-[15px] leading-7 text-gray-700">
              At Mavish, customer satisfaction is our priority. We carefully design and prepare every outfit with love and attention to detail. Please read our Return &amp; Exchange Policy carefully before placing an order.
            </p>

            <div className="mt-10 space-y-8">
              {/* Return Policy */}
              <div>
                <h2 className="mb-3 text-[22px] font-black text-black">
                  1. Return &amp; Exchange Policy
                </h2>

                <div className="space-y-4 text-[15px] leading-7 text-gray-800">
                  <p>
                    Exchange requests can be made within{" "}
                    <span className="font-bold text-black">2–3 days</span> after receiving the parcel.
                  </p>

                  <p>Exchanges are only accepted in case of:</p>

                  <ul className="space-y-2 pl-5">
                    <li>• Wrong item received</li>
                    <li>• Damaged product</li>
                    <li>• Size issue</li>
                  </ul>

                  <p>
                    Items must be unused, unwashed, undamaged, and returned with original tags and packaging.
                  </p>

                  <p>Sale items and customized outfits are not eligible for return or exchange.</p>
                </div>
              </div>

              {/* No Refund */}
              <div>
                <h2 className="mb-3 text-[22px] font-black text-black">
                  2. Refund Policy
                </h2>

                <div className="space-y-4 text-[15px] leading-7 text-gray-800">
                  <p>Mavish does not offer refunds on orders.</p>

                  <p>We only provide exchanges for eligible cases mentioned in our Exchange Policy.</p>

                  <p>Advance payments made for orders are non-refundable.</p>
                </div>
              </div>

              {/* Custom Orders */}
              <div>
                <h2 className="mb-3 text-[22px] font-black text-black">
                  3. Custom Orders
                </h2>

                <div className="space-y-4 text-[15px] leading-7 text-gray-800">
                  <p>
                    Customized and made-to-order articles require advance payment and are strictly non-refundable and non-exchangeable.
                  </p>

                  <p>
                    Please confirm all measurements and order details carefully before placing your order.
                  </p>
                </div>
              </div>

              {/* Exchange Process */}
              <div>
                <h2 className="mb-3 text-[22px] font-black text-black">
                  4. How to Request an Exchange
                </h2>

                <div className="space-y-4 text-[15px] leading-7 text-gray-800">
                  <p>
                    To request an exchange, contact our Customer Support team within 2–3 days of receiving your parcel.
                  </p>

                  <p>Please share:</p>

                  <ul className="space-y-2 pl-5">
                    <li>• Your Order Number</li>
                    <li>• Clear pictures of the item</li>
                    <li>• Reason for exchange</li>
                  </ul>

                  <p>
                    Our support team will guide you through the exchange procedure after reviewing your request.
                  </p>
                </div>
              </div>

              {/* Delivery */}
              <div>
                <h2 className="mb-3 text-[22px] font-black text-black">
                  5. Delivery &amp; Shipping
                </h2>

                <div className="space-y-4 text-[15px] leading-7 text-gray-800">
                  <p>
                    Delivery time is usually 5–10 working days depending on product availability and order volume.
                  </p>

                  <p>
                    Delays may occur during peak seasons such as Eid, weddings, or sale periods.
                  </p>

                  <p>
                    Courier delays caused by shipping companies are beyond our control.
                  </p>
                </div>
              </div>

              {/* Important Note */}
              <div>
                <h2 className="mb-3 text-[22px] font-black text-black">
                  6. Important Notes
                </h2>

                <div className="space-y-4 text-[15px] leading-7 text-gray-800">
                  <p>Slight color variations may occur due to lighting and screen resolution.</p>

                  <p>
                    Handmade embellishments and detailing may slightly vary from the displayed images.
                  </p>

                  <p>
                    By placing an order with Mavish, you agree to our Return &amp; Exchange Policy.
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div className="rounded-xl bg-gray-50 p-5">
                <h2 className="mb-3 text-[22px] font-black text-black">Need Help?</h2>

                <p className="text-[15px] leading-7 text-gray-800">
                  For any questions regarding returns, exchanges, or orders, feel free to contact our support team.
                </p>

                <div className="mt-4 space-y-2 text-[15px] font-semibold text-black">
                  <p>Email: mavishboutique1@gmail.com</p>
                  <p>WhatsApp: +92 300 8462848</p>
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

