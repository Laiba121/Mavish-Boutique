import { useState } from "react";
import { Mail } from "lucide-react";
import axios from "axios";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    comment: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setSuccess("");

      const res = await axios.post("http://localhost:5000/api/contacts", formData);
      setSuccess(res.data.message || "Message submitted successfully!" );

      setFormData({ name: "", phone: "", email: "", comment: "" });
    } catch (err) {
      alert(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="bg-[#f7f7f7] pt-[120px] pb-16">
        <section className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="text-center">
            <p className="font-body text-[15px] uppercase tracking-[0.15em] text-[#333]">
              Contact Us
            </p>

            <h1 className="mt-8 font-display text-[40px] font-black uppercase text-[#2a2a2a]">
              Get In Touch
            </h1>
          </div>

          <div className="mt-16 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
            {/* Left Side */}
            <div>
              <h2 className="font-body text-[24px] font-bold text-[#2a2a2a]">
                Send us an email
              </h2>
              <p className="mt-3 text-[14px] text-[#555]">Ask us anything! We&apos;re here to help.</p>

              {success && (
                <div className="mt-5 rounded-md bg-green-100 px-4 py-3 text-[14px] font-semibold text-green-700">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div>
                  <label className="mb-2 block text-[14px] font-semibold text-[#333]">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="h-[52px] w-full border border-gray-300 bg-transparent px-4 outline-none transition-all focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[14px] font-semibold text-[#333]">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="h-[52px] w-full border border-gray-300 bg-transparent px-4 outline-none transition-all focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[14px] font-semibold text-[#333]">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="h-[52px] w-full border border-gray-300 bg-transparent px-4 outline-none transition-all focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[14px] font-semibold text-[#333]">
                    Comment <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="comment"
                    value={formData.comment}
                    onChange={handleChange}
                    required
                    rows={7}
                    className="w-full resize-none border border-gray-300 bg-transparent p-4 outline-none transition-all focus:border-black"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="h-[52px] bg-[#1f2b57] px-10 text-[13px] font-black uppercase tracking-[0.08em] text-white transition-all hover:opacity-90"
                >
                  {loading ? "Submitting..." : "Submit Contact"}
                </button>
              </form>
            </div>

            {/* Right Side */}
            <div className="h-fit bg-[#f1f1f1] p-8">
              <h3 className="text-[26px] font-bold text-[#333]">Live Help</h3>

              <div className="mt-8 space-y-5 text-[14px] leading-7 text-[#555]">
                <div>
                  <p className="font-semibold text-[#333]">WhatsApp Us:</p>
                  <p>We&apos;re available on WhatsApp Live Chat.</p>
                </div>

                <div>
                  <p className="font-semibold text-[#333]">Customer Support:</p>
                  <p>9:00am – 5:00pm</p>
                  <p>+92 300 100 3187</p>
                </div>

                <div>
                  <p className="font-semibold text-[#333]">General Information:</p>
                  <p>9:00am – 9:00pm</p>
                  <p>+92 300 100 3448</p>
                </div>

                <div className="flex items-start gap-3">
                  <Mail size={18} className="mt-1" />
                  <p>customercare@mavish.com</p>
                </div>

                <div>
                  <p>
                    15-km, Hafizabad Road, Adjacent Qila Marriage Hall, Qila Didar Singh,
                    Gujranwala
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

