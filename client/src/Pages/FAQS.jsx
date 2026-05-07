import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQS() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = useMemo(
    () => [
      {
        question: "How can I place an order?",
        answer:
          "You can place an order directly through our website by selecting your desired outfit, size, and completing the checkout process.",
      },
      {
        question: "Is advance payment required?",
        answer:
          "Yes, a 50% advance payment is required to confirm all orders. Custom orders may require full advance payment.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept Bank Transfer, EasyPaisa, JazzCash, and Debit/Credit Card payments.",
      },
      {
        question: "How long does delivery take?",
        answer:
          "Delivery usually takes 15–20 working days depending on order volume and location.",
      },
      {
        question: "Do you offer Cash on Delivery (COD)?",
        answer:
          "Yes 50% and 50% COD.",
      },
      {
        question: "Can I cancel my order?",
        answer:
          "Orders cannot be cancelled once they have been confirmed and processed.",
      },
      {
        question: "Do you offer returns or refunds?",
        answer:
          "We do not offer refunds. Exchanges are only available for damaged, incorrect, or size issue items.",
      },
      {
        question: "How can I request an exchange?",
        answer:
          "You can contact our Customer Support within 2–3 days of receiving your parcel along with your order details and product images.",
      },
      {
        question: "Are sale items exchangeable?",
        answer:
          "No, sale items and discounted articles cannot be exchanged or returned.",
      },
      {
        question: "Are custom orders refundable or exchangeable?",
        answer:
          "No, customized and made-to-order outfits are non-refundable and non-exchangeable.",
      },
      {
        question: "How do I choose the correct size?",
        answer:
          "Please carefully check our size chart before placing your order. If you need help, our support team will gladly assist you.",
      },
      {
        question: "Will the product color exactly match the pictures?",
        answer:
          "Slight color variations may occur due to lighting, photography, and screen settings.",
      },
      {
        question: "How can I contact Mavish support?",
        answer:
          "You can contact us through WhatsApp or email for any order or product-related assistance.",
      },
    ],
    []
  );

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Navbar />

      <main className="pt-[110px] pb-12 bg-white">
        <section className="mx-auto max-w-7xl px-6 sm:px-8 pt-[25px] lg:pt-[100px]">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-10 shadow-sm">
            <h1 className="font-display text-[34px] font-black leading-tight text-black sm:text-[44px]">
              Frequently Asked Questions
            </h1>

            <p className="mt-3 text-[15px] leading-7 text-gray-600 max-w-3xl">
              Find answers to the most common questions about orders, delivery,
              payments, exchanges, and more.
            </p>

            <div className="mt-10 space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;

                return (
                  <div
                    key={index}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
                  >
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="flex w-full items-center justify-between px-5 py-5 text-left"
                      type="button"
                    >
                      <span className="text-[15px] font-bold text-black sm:text-[16px]">
                        {faq.question}
                      </span>

                      <ChevronDown
                        size={20}
                        className={`transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <div
                      className={`grid transition-all duration-300 ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-5 pb-5 text-[14px] leading-7 text-gray-700">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

