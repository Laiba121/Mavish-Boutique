import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { removeFromCart, updateQuantity } from '../store/cartSlice';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector((s) => s.cart.items);
  const [note, setNote] = useState('');

  const subtotal = items.reduce((sum, i) => {
    const price = i.isSale && i.salePrice ? i.salePrice : i.price;
    return sum + price * i.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-3 lg:px-10 pt-[56px] lg:pt-[177px] pb-20">

        {/* Breadcrumb */}
        <nav className="py-4 text-sm text-gray-400 flex items-center gap-1.5 border-b border-gray-100 mb-8">
          <Link to="/" className="hover:text-gray-600 transition">Home</Link>
          <span>›</span>
          <span className="text-gray-700 font-medium">Your Cart</span>
        </nav>

        <h1 className="text-2xl font-bold uppercase tracking-widest text-gray-900 mb-8">
          Your Cart
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-base mb-6">Your cart is empty.</p>
            <Link
              to="/"
              className="inline-block bg-gray-900 text-white text-sm font-semibold uppercase tracking-widest px-8 py-3 hover:bg-black transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10 items-start">

            {/* LEFT — Cart items table */}
            <div className="flex-1 w-full">

              {/* Table header */}
              <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-gray-200 pb-3 mb-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Product</span>
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 text-center">Price</span>
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 text-center">Quantity</span>
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 text-center">Total</span>
                <span />
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-100">
                {items.map((item, idx) => {
                  const price = item.isSale && item.salePrice ? item.salePrice : item.price;
                  const total = price * item.quantity;
                  return (
                    <div
                      key={`${item._id}-${item.size}-${idx}`}
                      className="py-5 grid grid-cols-[auto_1fr] md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center"
                    >
                      {/* Product — image + name + size */}
                      <div className="flex items-center gap-4 md:col-span-1 col-span-2 md:col-auto">
                        <div className="w-[80px] h-[80px] shrink-0 bg-gray-100 rounded overflow-hidden border border-gray-200">
                          <img
                            src={item.images?.[0] || '/images/logo.avif'}
                            alt={item.name}
                            className="w-full h-full object-cover object-top"
                            onError={(e) => { e.target.src = '/images/logo.avif'; }}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 leading-snug">{item.name}</p>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="text-sm text-gray-500">{item.size}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="hidden md:flex justify-center">
                        <span className="text-sm text-gray-700">Rs.{price?.toLocaleString()}.00</span>
                      </div>

                      {/* Quantity stepper */}
                      <div className="hidden md:flex justify-center">
                        <div className="inline-flex items-center border border-gray-300">
                          <button
                            type="button"
                            onClick={() =>
                              item.quantity > 1
                                ? dispatch(updateQuantity({ id: item._id, size: item.size, quantity: item.quantity - 1 }))
                                : dispatch(removeFromCart({ id: item._id, size: item.size }))
                            }
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 border-r border-gray-300 transition"
                          >
                            −
                          </button>
                          <span className="w-10 h-8 flex items-center justify-center text-sm font-semibold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              dispatch(updateQuantity({ id: item._id, size: item.size, quantity: item.quantity + 1 }))
                            }
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 border-l border-gray-300 transition"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="hidden md:flex justify-center">
                        <span className="text-sm font-semibold text-gray-900">Rs.{total?.toLocaleString()}.00</span>
                      </div>

                      {/* Remove */}
                      <div className="hidden md:flex justify-center">
                        <button
                          type="button"
                          onClick={() => dispatch(removeFromCart({ id: item._id, size: item.size }))}
                          className="text-gray-300 hover:text-red-400 transition"
                        >
                          <X size={18} strokeWidth={1.8} />
                        </button>
                      </div>

                      {/* Mobile: price + qty + remove row */}
                      <div className="md:hidden col-span-2 flex items-center justify-between mt-1">
                        <span className="text-sm text-gray-700">Rs.{price?.toLocaleString()}.00</span>
                        <div className="inline-flex items-center border border-gray-300">
                          <button
                            type="button"
                            onClick={() =>
                              item.quantity > 1
                                ? dispatch(updateQuantity({ id: item._id, size: item.size, quantity: item.quantity - 1 }))
                                : dispatch(removeFromCart({ id: item._id, size: item.size }))
                            }
                            className="w-8 h-8 flex items-center justify-center text-gray-500 border-r border-gray-300"
                          >−</button>
                          <span className="w-9 h-8 flex items-center justify-center text-sm font-semibold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => dispatch(updateQuantity({ id: item._id, size: item.size, quantity: item.quantity + 1 }))}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 border-l border-gray-300"
                          >+</button>
                        </div>
                        <span className="text-sm font-semibold">Rs.{total?.toLocaleString()}.00</span>
                        <button
                          type="button"
                          onClick={() => dispatch(removeFromCart({ id: item._id, size: item.size }))}
                          className="text-gray-300 hover:text-red-400 transition"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Additional Comments */}
              <div className="mt-8">
                <p className="text-sm font-semibold text-gray-800 mb-2">Additional Comments</p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Special instruction for seller..."
                  rows={4}
                  className="w-full max-w-lg border border-gray-300 rounded-sm px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-500 resize-y"
                />
              </div>

              {/* Secure shopping */}
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Secure shopping guarantee
              </div>
            </div>

            {/* RIGHT — Order Summary */}
            <div className="w-full lg:w-[320px] shrink-0">
              <div className="border border-gray-200 p-6">
                <h2 className="text-base font-bold uppercase tracking-widest text-gray-900 border-b border-gray-200 pb-4 mb-4">
                  Order Summary
                </h2>

                <div className="flex justify-between text-sm text-gray-700 mb-3">
                  <span>Subtotal</span>
                  <span className="font-semibold">Rs.{subtotal.toLocaleString()}.00</span>
                </div>

                <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-100 pt-3 mb-1">
                  <span className="uppercase tracking-wider">Total:</span>
                  <span className="text-[#2b3a7a] text-base">Rs.{subtotal.toLocaleString()}.00</span>
                </div>

                <p className="text-xs text-gray-400 mb-5">Tax included and shipping calculated at checkout</p>

                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="w-full py-3.5 bg-[#2b3a7a] text-white text-sm font-bold uppercase tracking-widest hover:bg-[#1e2d63] transition mb-3"
                >
                  Proceed to Checkout
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="w-full py-3.5 border border-gray-300 text-sm font-semibold text-gray-700 uppercase tracking-widest hover:bg-gray-50 transition"
                >
                  Continue Shopping
                </button>
              </div>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}