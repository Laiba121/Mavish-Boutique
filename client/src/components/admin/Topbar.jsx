import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { Bell, Search, X, Package, ShoppingBag, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function Topbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  const searchRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch recent orders as notifications
  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await api.get('/checkout/orders?pageSize=20');
        const data = res.data;
        const orders = Array.isArray(data) ? data : Array.isArray(data?.orders) ? data.orders : [];
        const notifs = orders.slice(0, 8).map((o) => ({
          id: o._id,
          title: `New order ${o.orderNumber || `#${o._id?.slice(-6)}`}`,
          sub: `${o.shippingAddress?.firstName || ''} · Rs. ${o.total?.toLocaleString()}`,
          time: new Date(o.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }),
          status: o.status,
          unread: o.status === 'confirmed' || o.status === 'pending',
        }));
        setNotifications(notifs);
        setUnread(notifs.filter(n => n.unread).length);
      } catch {
        // silent
      }
    }
    fetchNotifications();
  }, []);

  // Search orders
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get('/checkout/orders?pageSize=100');
        const data = res.data;
        const orders = Array.isArray(data) ? data : Array.isArray(data?.orders) ? data.orders : [];
        const q = searchQuery.toLowerCase();
        const results = orders.filter(o =>
          o.orderNumber?.toLowerCase().includes(q) ||
          o.email?.toLowerCase().includes(q) ||
          o.shippingAddress?.firstName?.toLowerCase().includes(q) ||
          o.shippingAddress?.lastName?.toLowerCase().includes(q)
        ).slice(0, 6);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const STATUS_DOT = {
    confirmed: 'bg-blue-500', shipped: 'bg-teal-500',
    delivered: 'bg-green-500', cancelled: 'bg-red-500', pending: 'bg-yellow-500',
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-30 mt-[73px] lg:mt-0">

      {/* Left */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Admin Panel</h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Welcome back, Admin</p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Search */}
        <div ref={searchRef} className="relative">
          <button
            onClick={() => { setSearchOpen(v => !v); setTimeout(() => document.getElementById('admin-search')?.focus(), 50); }}
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition"
          >
            <Search size={18} className="text-gray-600" />
          </button>

          {searchOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
                <Search size={14} className="text-gray-400 shrink-0" />
                <input
                  id="admin-search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search orders, customers…"
                  className="flex-1 text-sm text-gray-800 outline-none placeholder-gray-400 bg-transparent"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')}>
                    <X size={13} className="text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto">
                {searching && (
                  <div className="px-4 py-3 text-xs text-gray-400 text-center">Searching…</div>
                )}
                {!searching && searchQuery && searchResults.length === 0 && (
                  <div className="px-4 py-3 text-xs text-gray-400 text-center">No results found</div>
                )}
                {!searching && searchResults.map(order => (
                  <button
                    key={order._id}
                    onClick={() => { navigate('/admin/orders'); setSearchOpen(false); setSearchQuery(''); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <Package size={13} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{order.orderNumber || `#${order._id?.slice(-6)}`}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {`${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim() || order.email}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-gray-600 shrink-0">Rs. {order.total?.toLocaleString()}</span>
                  </button>
                ))}
                {!searchQuery && (
                  <div className="px-4 py-6 text-center">
                    <Search size={20} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Type to search orders or customers</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen(v => !v); setUnread(0); }}
            className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition"
          >
            <Bell size={18} className="text-gray-600" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center leading-none">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                <button onClick={() => setNotifOpen(false)}>
                  <X size={14} className="text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <Bell size={20} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">No notifications yet</p>
                  </div>
                )}
                {notifications.map(n => (
                  <button
                    key={n.id}
                    onClick={() => { navigate('/admin/orders'); setNotifOpen(false); }}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${STATUS_DOT[n.status] || 'bg-gray-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{n.title}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{n.sub}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">{n.time}</span>
                  </button>
                ))}
              </div>

              <div className="px-4 py-2.5 border-t border-gray-100">
                <button
                  onClick={() => { navigate('/admin/orders'); setNotifOpen(false); }}
                  className="text-xs text-[#2b3a7a] font-semibold hover:underline"
                >
                  View all orders →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={() => dispatch(logout())}
          className="bg-black hover:bg-gray-800 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}