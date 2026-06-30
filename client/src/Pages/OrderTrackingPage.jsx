import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Package, CheckCircle, Truck, MapPin, Clock, XCircle } from 'lucide-react';
import api from "../utils/api";

// ── Status config ─────────────────────────────────────────────────────────────
const STEPS = [
  { key: 'confirmed',  label: 'Order Confirmed',  icon: CheckCircle },
  { key: 'processing', label: 'Processing',        icon: Clock       },
  { key: 'shipped',    label: 'Shipped',           icon: Truck       },
  { key: 'delivered',  label: 'Delivered',         icon: MapPin      },
];

const STEP_INDEX = { confirmed: 0, processing: 1, shipped: 2, delivered: 3 };

const PAYMENT_STATUS_LABEL = {
  pending:           { label: 'Pending',            color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  advance_pending:   { label: 'Advance Pending',    color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  advance_confirmed: { label: 'Advance Confirmed',  color: 'bg-blue-50 text-blue-700 border-blue-200'       },
  paid:              { label: 'Paid',               color: 'bg-green-50 text-green-700 border-green-200'    },
  failed:            { label: 'Failed',             color: 'bg-red-50 text-red-700 border-red-200'          },
  refunded:          { label: 'Refunded',           color: 'bg-gray-100 text-gray-600 border-gray-200'      },
};

const ADVANCE_METHOD_LABEL = {
  card:       'Debit / Credit Card',
  easypaisa:  'EasyPaisa',
  jazzcash:   'JazzCash',
  bank:       'Bank Transfer',
};

export default function OrderTrackingPage() {
  const [query,   setQuery]   = useState('');
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const inputCls = "w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#2b3a7a] focus:ring-1 focus:ring-[#2b3a7a] transition bg-white";

  async function handleSearch(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setError('');
    setOrder(null);
    setLoading(true);

    try {
  const { data } = await api.get("checkout/track", {
    params: {
      q: query.trim(),
    },
  });

  setOrder(data);
} catch (err) {
  setError(
    err.response?.data?.message ||
    "Order not found. Please check your order number or email."
  );
} finally {
  setLoading(false);
}
  }

  const stepIndex    = order ? (STEP_INDEX[order.status] ?? -1) : -1;
  const isCancelled  = order?.status === 'cancelled';
  const paymentInfo  = order ? PAYMENT_STATUS_LABEL[order.paymentStatus] : null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-center">
          <Link to="/">
            <img src="/images/logo1.png" alt="Logo" className="h-10 object-contain" onError={e => { e.target.style.display = 'none'; }} />
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">

        {/* Search card */}
        <div className="bg-white border border-gray-200 rounded p-6 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Package size={18} className="text-[#2b3a7a]" />
            <h1 className="text-base font-semibold text-gray-900">Track your order</h1>
          </div>
          <p className="text-xs text-gray-400 mb-4">Enter your order number (e.g. ORD-20250506-00001) or the email used at checkout.</p>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Order number or email address"
              className={inputCls}
            />
            <button
              type="submit"
              disabled={loading}
              className="shrink-0 px-4 py-2.5 bg-[#2b3a7a] hover:bg-[#1e2d63] disabled:opacity-60 text-white text-sm font-semibold rounded transition flex items-center gap-1.5"
            >
              <Search size={14} />
              {loading ? 'Searching…' : 'Track'}
            </button>
          </form>

          {error && (
            <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* ── Result ── */}
        {order && (
          <div className="space-y-4">

            {/* Order header */}
            <div className="bg-white border border-gray-200 rounded p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Order number</p>
                  <p className="text-lg font-bold text-[#2b3a7a]">{order.orderNumber}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {/* Order status badge */}
                  {isCancelled ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                      <XCircle size={12} /> Cancelled
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {STEPS[stepIndex]?.label || order.status}
                    </span>
                  )}
                  {/* Payment status badge */}
                  {paymentInfo && (
                    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${paymentInfo.color}`}>
                      {paymentInfo.label}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress stepper */}
              {!isCancelled && (
                <div className="mt-6">
                  <div className="relative flex items-center justify-between">
                    {/* Progress line background */}
                    <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200 z-0" />
                    {/* Progress line fill */}
                    <div
                      className="absolute left-0 top-4 h-0.5 bg-[#2b3a7a] z-0 transition-all duration-500"
                      style={{ width: stepIndex >= 0 ? `${(stepIndex / (STEPS.length - 1)) * 100}%` : '0%' }}
                    />
                    {STEPS.map((step, i) => {
                      const done    = i <= stepIndex;
                      const current = i === stepIndex;
                      const Icon    = step.icon;
                      return (
                        <div key={step.key} className="relative z-10 flex flex-col items-center gap-2" style={{ width: `${100 / STEPS.length}%` }}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                            done
                              ? 'bg-[#2b3a7a] border-[#2b3a7a]'
                              : 'bg-white border-gray-300'
                          } ${current ? 'ring-4 ring-[#2b3a7a]/20' : ''}`}>
                            <Icon size={14} className={done ? 'text-white' : 'text-gray-400'} />
                          </div>
                          <span className={`text-center text-xs leading-tight ${done ? 'text-[#2b3a7a] font-semibold' : 'text-gray-400'}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {isCancelled && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded px-4 py-3 text-sm text-red-700">
                  This order has been cancelled. If you have questions, please contact us.
                </div>
              )}
            </div>

            {/* Payment info */}
            <div className="bg-white border border-gray-200 rounded p-6">
              <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4">Payment</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-blue-50 border border-blue-100 rounded p-3">
                  <p className="text-xs text-blue-500 mb-1">Advance paid</p>
                  <p className="font-bold text-blue-800">Rs {order.advanceAmount?.toLocaleString()}.00</p>
                  <p className="text-xs text-blue-600 mt-0.5">{ADVANCE_METHOD_LABEL[order.advanceMethod] || '—'}</p>
                </div>
                <div className="bg-green-50 border border-green-100 rounded p-3">
                  <p className="text-xs text-green-500 mb-1">Due on delivery</p>
                  <p className="font-bold text-green-800">Rs {order.codAmount?.toLocaleString()}.00</p>
                  <p className="text-xs text-green-600 mt-0.5">Cash on delivery</p>
                </div>
              </div>
              <div className="mt-3 flex justify-between text-sm font-bold text-gray-900 border-t border-gray-100 pt-3">
                <span>Order total</span>
                <span className="text-[#2b3a7a]">PKR Rs {order.total?.toLocaleString()}.00</span>
              </div>
            </div>

            {/* Items */}
            {order.items?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded p-6">
                <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4">Items</h2>
                <div className="divide-y divide-gray-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center gap-3">
                      <div className="w-12 h-12 rounded border border-gray-200 overflow-hidden bg-gray-100 shrink-0">
                        <img src={item.image || '/images/logo.avif'} alt={item.name} className="w-full h-full object-cover object-top" onError={e => { e.target.src = '/images/logo.avif'; }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        {item.size && <p className="text-xs text-gray-400">{item.size}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-gray-800">Rs {(item.price * item.quantity).toLocaleString()}.00</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shipping address */}
            {order.shippingAddress && (
              <div className="bg-white border border-gray-200 rounded p-6">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={15} className="text-gray-400" />
                  <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Shipping to</h2>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                  {order.shippingAddress.address}{order.shippingAddress.apartment ? `, ${order.shippingAddress.apartment}` : ''}<br />
                  {order.shippingAddress.city}{order.shippingAddress.postalCode ? ` ${order.shippingAddress.postalCode}` : ''}, {order.shippingAddress.country}<br />
                  {order.shippingAddress.phone}
                </p>
              </div>
            )}

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 pb-4">
              <Link to="/" className="flex-1 text-center py-3 bg-[#2b3a7a] hover:bg-[#1e2d63] text-white text-sm font-bold uppercase tracking-widest rounded transition">
                Continue Shopping
              </Link>
              <Link to="/account/orders" className="flex-1 text-center py-3 border border-gray-300 text-sm font-semibold text-gray-700 uppercase tracking-widest rounded hover:bg-gray-50 transition">
                All Orders
              </Link>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}