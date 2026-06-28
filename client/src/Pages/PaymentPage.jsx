import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PaymentPage() {
  return (
    <>
      <Navbar />

      <main className="bg-[#fafafa] pb-14 pt-[110px]">
        <section className="mx-auto max-w-7xl px-6 sm:px-8 pt-[25px] lg:pt-[100px]">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
            <h1 className="font-display text-[34px] font-black leading-tight text-black sm:text-[44px]">
              Payment Policy
            </h1>

            <p className="mt-4 max-w-3xl text-[15px] leading-7 text-gray-700">
              At Mavish Boutique, we aim to provide a secure, transparent, and
              smooth payment experience for all customers. Please carefully read
              our payment terms before placing an order.
            </p>

            <div className="mt-10 space-y-8">
              {/* Advance Payment */}
              <div>
                <h2 className="mb-3 text-[22px] font-black text-black">
                  Advance Payment
                </h2>

                <div className="space-y-4 text-[15px] leading-7 text-gray-800">
                  <p>
                    A{" "}
                    <span className="font-bold text-black">
                      50% advance payment
                    </span>{" "}
                    is required to confirm all custom and stitched orders.
                  </p>

                  <p>
                    Orders will only be processed after the advance payment has
                    been successfully received and verified.
                  </p>

                  <p>
                    Remaining payment must be completed before shipment or at
                    the time of dispatch.
                  </p>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h2 className="mb-3 text-[22px] font-black text-black">
                  Accepted Payment Methods
                </h2>

                <ul className="space-y-3 text-[15px] leading-7 text-gray-800">
                  <li>• Bank Transfer</li>
                  <li>• JazzCash</li>
                  <li>• EasyPaisa</li>
                  <li>• Debit / Credit Cards</li>
                </ul>
              </div>

              {/* Order Processing */}
              <div>
                <h2 className="mb-3 text-[22px] font-black text-black">
                  Order Processing
                </h2>

                <div className="space-y-4 text-[15px] leading-7 text-gray-800">
                  <p>
                    Once payment is confirmed, your order enters the processing
                    phase. Processing times may vary depending on product
                    availability, customization requirements, and seasonal
                    demand.
                  </p>

                  <p>
                    Customers will receive order confirmation and payment
                    verification updates via email or WhatsApp.
                  </p>
                </div>
              </div>

              {/* Refunds */}
              <div>
                <h2 className="mb-3 text-[22px] font-black text-black">
                  Refund & Cancellation Policy
                </h2>

                <div className="space-y-4 text-[15px] leading-7 text-gray-800">
                  <p>
                    Orders once confirmed and processed cannot be cancelled
                    after production has started.
                  </p>

                  <p>
                    Advance payments for customized or stitched articles are
                    non-refundable.
                  </p>

                  <p>
                    Refund requests for eligible orders will be reviewed and
                    processed within 7–14 business days.
                  </p>
                </div>
              </div>

              {/* Security */}
              <div>
                <h2 className="mb-3 text-[22px] font-black text-black">
                  Payment Security
                </h2>

                <div className="space-y-4 text-[15px] leading-7 text-gray-800">
                  <p>
                    We prioritize the security of your payment information. All
                    transactions are processed through secure and trusted
                    payment channels.
                  </p>

                  <p>
                    Mavish Boutique does not store sensitive card or banking
                    details on its servers.
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div className="rounded-xl bg-gray-50 p-5">
                <h2 className="mb-3 text-[22px] font-black text-black">
                  Need Help?
                </h2>

                <p className="text-[15px] leading-7 text-gray-800">
                  If you have any questions regarding payments, transactions, or
                  order confirmation, feel free to contact our support team.
                </p>

                <div className="mt-4 space-y-2 text-[15px] font-semibold text-black">
                  <p>Email: mavishboutique1@gmail.com</p>
                  <p>WhatsApp: +92 301 7354400</p>
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