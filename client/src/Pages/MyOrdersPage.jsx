import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Package, ChevronRight, Search, ShoppingBag } from 'lucide-react';
import api from "../utils/api";

// ── Status badge config ───────────────────────────────────────────────────────
const STATUS_BADGE = {
  pending:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed:  'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-purple-50 text-purple-700 border-purple-200',
  shipped:    'bg-teal-50 text-teal-700 border-teal-200',
  delivered:  'bg-green-50 text-green-700 border-green-200',
  cancelled:  'bg-red-50 text-red-700 border-red-200',
};

const PAYMENT_BADGE = {
  pending:           'bg-yellow-50 text-yellow-700 border-yellow-200',
  advance_pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  advance_confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  paid:              'bg-green-50 text-green-700 border-green-200',
  failed:            'bg-red-50 text-red-700 border-red-200',
  refunded:          'bg-gray-100 text-gray-600 border-gray-200',
};

const PAYMENT_LABEL = {
  pending:           'Pending',
  advance_pending:   'Advance pending',
  advance_confirmed: 'Advance confirmed',
  paid:              'Paid',
  failed:            'Failed',
  refunded:          'Refunded',
};

const ADVANCE_METHOD = {
  card:      'Card',
  easypaisa: 'EasyPaisa',
  jazzcash:  'JazzCash',
  bank:      'Bank Transfer',
};

export default function MyOrdersPage() {
  const navigate = useNavigate();
  // Read auth state from Redux — adjust selector to match your authSlice shape
  const user = useSelector((s) => s.auth.user);
  // token may be at user.token or user.user.token depending on your API response shape
  const token = user?.token || user?.accessToken || null;

  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('all');

 useEffect(() => {
  async function fetchOrders() {
    try {
      const authToken = user?.token || user?.accessToken;
      const guestEmail = localStorage.getItem("guestEmail");

      // Attach guest orders after login
      if (authToken && guestEmail) {
        await api.post("checkout/attach-guest-orders", {
          email: guestEmail,
        });

        localStorage.removeItem("guestEmail");
      }

      let response;

      // Logged-in user
      if (authToken) {
        response = await api.get("checkout/orders/my");
      }
      // Guest user
      else if (guestEmail) {
        response = await api.get("checkout/orders/my", {
          params: {
            email: guestEmail,
          },
        });
      }
      // Neither logged in nor guest email
      else {
        setOrders([]);
        setLoading(false);
        return;
      }

      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load orders"
      );
    } finally {
      setLoading(false);
    }
  }

  fetchOrders();
}, [user]);

  // ── Filter + search ───────────────────────────────────────────────────────
  const visible = orders.filter((o) => {
    const matchesFilter = filter === 'all' || o.status === filter;
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      o.orderNumber?.toLowerCase().includes(q) ||
      o.items?.some((i) => i.name?.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  const counts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const inputCls = "w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#2b3a7a] focus:ring-1 focus:ring-[#2b3a7a] transition bg-white";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#2b3a7a] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-3 relative flex items-center justify-center">
          <Link to="/">
            <img src="/images/logo1.png" alt="Logo" className="h-10 object-contain" onError={e => { e.target.style.display = 'none'; }} />
          </Link>
          <button onClick={() => navigate('/cart')} className="absolute right-6 text-gray-500 hover:text-gray-700 transition">
            <ShoppingBag size={20} strokeWidth={1.6} />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* Page title */}
        <div className="flex items-center gap-2 mb-6">
          <Package size={20} className="text-[#2b3a7a]" />
          <h1 className="text-lg font-semibold text-gray-900">My orders</h1>
          {orders.length > 0 && (
            <span className="ml-1 text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full border border-gray-200">
              {orders.length}
            </span>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Summary stat pills */}
        {orders.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {[
              { key: 'all',       label: 'All',       count: orders.length },
              { key: 'confirmed', label: 'Confirmed', count: counts.confirmed  || 0 },
              { key: 'shipped',   label: 'Shipped',   count: counts.shipped    || 0 },
              { key: 'delivered', label: 'Delivered', count: counts.delivered  || 0 },
              { key: 'cancelled', label: 'Cancelled', count: counts.cancelled  || 0 },
            ].map(({ key, label, count }) => count > 0 || key === 'all' ? (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
                  filter === key
                    ? 'bg-[#2b3a7a] text-white border-[#2b3a7a]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {label} {count > 0 && <span className="ml-1 opacity-70">{count}</span>}
              </button>
            ) : null)}
          </div>
        )}

        {/* Search */}
        {orders.length > 0 && (
          <div className="relative mb-5">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by order number or item name…"
              className={`${inputCls} pl-8`}
            />
          </div>
        )}

        {/* Empty state */}
        {orders.length === 0 && !error && (
          <div className="bg-white border border-gray-200 rounded p-12 text-center">
            <Package size={40} strokeWidth={1.2} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-600 mb-1">No orders yet</p>
            <p className="text-xs text-gray-400 mb-5">Your orders will appear here once you place one.</p>
            <Link
              to="/"
              className="inline-block px-5 py-2.5 bg-[#2b3a7a] hover:bg-[#1e2d63] text-white text-sm font-bold uppercase tracking-widest rounded transition"
            >
              Start shopping
            </Link>
          </div>
        )}

        {/* No results from filter/search */}
        {orders.length > 0 && visible.length === 0 && (
          <div className="bg-white border border-gray-200 rounded p-8 text-center">
            <p className="text-sm text-gray-500">No orders match your search.</p>
            <button onClick={() => { setSearch(''); setFilter('all'); }} className="mt-3 text-sm text-[#2b3a7a] hover:underline">
              Clear filters
            </button>
          </div>
        )}

        {/* Orders list */}
        <div className="space-y-3">
          {visible.map((order) => {
            const firstItem  = order.items?.[0];
            const extraCount = (order.items?.length || 1) - 1;
            const date       = new Date(order.createdAt).toLocaleDateString('en-PK', {
              day: 'numeric', month: 'short', year: 'numeric',
            });

            return (
              <Link
                key={order._id}
                to={`/order-confirmation/${order._id}`}
                className="block bg-white border border-gray-200 hover:border-[#2b3a7a]/40 rounded transition group"
              >
                <div className="p-4">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-semibold text-[#2b3a7a] group-hover:underline">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{date}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${STATUS_BADGE[order.status] || STATUS_BADGE.pending}`}>
                        {order.status}
                      </span>
                      <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full border ${PAYMENT_BADGE[order.paymentStatus] || PAYMENT_BADGE.pending}`}>
                        {PAYMENT_LABEL[order.paymentStatus] || order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Item preview */}
                  {firstItem && (
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded border border-gray-200 bg-gray-100 overflow-hidden shrink-0">
                        <img
                          src={firstItem.image || '/images/logo.avif'}
                          alt={firstItem.name}
                          className="w-full h-full object-cover object-top"
                          onError={e => { e.target.src = '/images/logo.avif'; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{firstItem.name}</p>
                        {firstItem.size && (
                          <p className="text-xs text-gray-400 mt-0.5">Size: {firstItem.size}</p>
                        )}
                        {extraCount > 0 && (
                          <p className="text-xs text-gray-400 mt-0.5">+{extraCount} more item{extraCount > 1 ? 's' : ''}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bottom row */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      {order.advanceAmount > 0 ? (
                        <>
                          <span>
                            <span className="text-blue-600 font-semibold">Rs {order.advanceAmount?.toLocaleString()}.00</span>
                            {' '}advance
                            {order.advanceMethod && (
                              <span className="text-gray-400"> · {ADVANCE_METHOD[order.advanceMethod] || order.advanceMethod}</span>
                            )}
                          </span>
                          <span>+</span>
                          <span>
                            <span className="text-green-600 font-semibold">Rs {order.codAmount?.toLocaleString()}.00</span>
                            {' '}COD
                          </span>
                        </>
                      ) : (
                        <span className="text-green-600 font-semibold">Full COD</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-sm font-bold text-gray-900">
                        Rs {order.total?.toLocaleString()}.00
                      </span>
                      <ChevronRight size={15} className="text-gray-400 group-hover:text-[#2b3a7a] transition" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom links */}
        {orders.length > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              to="/"
              className="flex-1 text-center py-3 bg-[#2b3a7a] hover:bg-[#1e2d63] text-white text-sm font-bold uppercase tracking-widest rounded transition"
            >
              Continue shopping
            </Link>
            <Link
              to="/order-tracking"
              className="flex-1 text-center py-3 border border-gray-300 text-sm font-semibold text-gray-700 uppercase tracking-widest rounded hover:bg-gray-50 transition"
            >
              Track an order
            </Link>
          </div>
        )}

      </main>
    </div>
  );
}