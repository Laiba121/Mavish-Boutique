import { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import Topbar from '../../components/admin/Topbar';
import api from '../../utils/api';

const STATUS_COLOR = {
  confirmed:  { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  shipped:    { bg: 'bg-teal-50',   text: 'text-teal-700',   dot: 'bg-teal-500' },
  delivered:  { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500' },
  cancelled:  { bg: 'bg-red-50',    text: 'text-red-600',    dot: 'bg-red-500' },
  pending:    { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  processing: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
};

// Simple bar chart using divs
function BarChart({ data, label }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-28 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div className="relative w-full flex items-end justify-center" style={{ height: '88px' }}>
            <div
              className="w-full rounded-t-sm bg-[#2b3a7a] opacity-80 group-hover:opacity-100 transition-all duration-500"
              style={{ height: `${Math.max((d.value / max) * 88, 3)}px` }}
              title={`${d.label}: ${d.value}`}
            />
          </div>
          <span className="text-[9px] text-gray-400 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// Donut chart using SVG
function DonutChart({ segments }) {
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  let cumulative = 0;
  const r = 40, cx = 50, cy = 50, strokeWidth = 14;
  const circumference = 2 * Math.PI * r;

  return (
    <svg viewBox="0 0 100 100" className="w-32 h-32">
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const offset = circumference * (1 - pct);
        const rotation = cumulative * 360 - 90;
        cumulative += pct;
        return (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference * pct} ${circumference * (1 - pct)}`}
            strokeDashoffset={circumference * 0.25}
            transform={`rotate(${rotation - 90} ${cx} ${cy})`}
            className="transition-all duration-700"
          />
        );
      })}
      <text x="50" y="47" textAnchor="middle" className="text-xs" fontSize="11" fontWeight="700" fill="#1f2937">{total}</text>
      <text x="50" y="58" textAnchor="middle" fontSize="7" fill="#9ca3af">orders</text>
    </svg>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, productsRes, usersRes] = await Promise.allSettled([
          api.get('/checkout/orders?pageSize=100'),
          api.get('/admin/products'),
          api.get('/admin/users/count'),
        ]);

        // Orders
        const od = ordersRes.status === 'fulfilled' ? ordersRes.value?.data : null;
        const allOrders = Array.isArray(od) ? od : Array.isArray(od?.orders) ? od.orders : [];
        setRecentOrders(allOrders.slice(0, 8));
        setAllOrders(allOrders);

        // Derive stats entirely from real data
        const revenue = allOrders.reduce((s, o) => s + (o.total || 0), 0);
        const pd = productsRes.status === 'fulfilled' ? productsRes.value?.data : null;
        const products = Array.isArray(pd) ? pd.length : (pd?.products?.length || pd?.total || 0);
        const ud = usersRes.status === 'fulfilled' ? usersRes.value?.data : null;
        const users = ud?.count || ud?.total || ud?.users || 0;

        setStats({
          orders: allOrders.length,
          revenue,
          products,
          users,
        });
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Derive chart data from recent orders
  const statusCounts = recentOrders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const donutSegments = [
    { label: 'Confirmed',  value: statusCounts.confirmed  || 0, color: '#3b82f6' },
    { label: 'Shipped',    value: statusCounts.shipped    || 0, color: '#14b8a6' },
    { label: 'Delivered',  value: statusCounts.delivered  || 0, color: '#22c55e' },
    { label: 'Cancelled',  value: statusCounts.cancelled  || 0, color: '#ef4444' },
    { label: 'Pending',    value: statusCounts.pending    || 0, color: '#f59e0b' },
  ].filter(s => s.value > 0);

  // Last 7 days bar chart (mock from recent orders by date)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString('en', { weekday: 'short' });
    const dateStr = d.toISOString().slice(0, 10);
    const value = recentOrders.filter(o => o.createdAt?.slice(0, 10) === dateStr).length;
    return { label, value };
  });

  const statCards = [
    {
      label: 'Total Orders',
      value: stats.orders || 0,
      icon: '📦',
      color: 'from-blue-500 to-blue-700',
      light: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Total Revenue',
      value: `Rs. ${(stats.revenue || 0).toLocaleString()}`,
      icon: '💰',
      color: 'from-emerald-500 to-emerald-700',
      light: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Products',
      value: stats.products || 0,
      icon: '🛍️',
      color: 'from-violet-500 to-violet-700',
      light: 'bg-violet-50 text-violet-700',
    },
    {
      label: 'Customers',
      value: stats.users || '—',
      icon: '👥',
      color: 'from-rose-500 to-rose-700',
      light: 'bg-rose-50 text-rose-700',
    },
  ];

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-[#2b3a7a] border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">Welcome back — here's what's happening today.</p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${card.light} shrink-0`}>
                  {card.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 font-medium truncate">{card.label}</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5 truncate">{card.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Orders this week bar chart */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-gray-800">Orders This Week</h2>
                  <p className="text-xs text-gray-400">Daily order volume</p>
                </div>
                <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full">Last 7 days</span>
              </div>
              <BarChart data={last7} />
            </div>

            {/* Order status donut */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-800 mb-1">Order Status</h2>
              <p className="text-xs text-gray-400 mb-4">Recent orders breakdown</p>
              <div className="flex items-center gap-4">
                <DonutChart segments={donutSegments.length ? donutSegments : [{ label: 'No data', value: 1, color: '#e5e7eb' }]} />
                <div className="space-y-1.5 flex-1 min-w-0">
                  {donutSegments.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                      <span className="text-xs text-gray-600 truncate">{s.label}</span>
                      <span className="text-xs font-semibold text-gray-800 ml-auto">{s.value}</span>
                    </div>
                  ))}
                  {donutSegments.length === 0 && <p className="text-xs text-gray-400">No orders yet</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Payment split summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: 'Total Advance Collected',
                value: `Rs. ${allOrders.reduce((s, o) => s + (o.advanceAmount || 0), 0).toLocaleString()}`,
                sub: 'From recent orders',
                color: 'border-l-blue-500',
              },
              {
                label: 'COD Pending',
                value: `Rs. ${allOrders.reduce((s, o) => s + (o.codAmount || 0), 0).toLocaleString()}`,
                sub: 'To be collected on delivery',
                color: 'border-l-green-500',
              },
              {
                label: 'Advance Pending Confirmation',
                value: allOrders.filter(o => o.paymentStatus === 'advance_pending').length,
                sub: 'Awaiting manual confirmation',
                color: 'border-l-amber-500',
              },
            ].map((c, i) => (
              <div key={i} className={`bg-white rounded-xl border border-gray-100 border-l-4 ${c.color} shadow-sm p-4`}>
                <p className="text-xs text-gray-400">{c.label}</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{c.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
              </div>
            ))}
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">Recent Orders</h2>
              <a href="/admin/orders" className="text-xs text-[#2b3a7a] font-semibold hover:underline">View all →</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider">
                    <th className="px-5 py-3 text-left font-medium">Order</th>
                    <th className="px-5 py-3 text-left font-medium">Customer</th>
                    <th className="px-5 py-3 text-left font-medium">Amount</th>
                    <th className="px-5 py-3 text-left font-medium">Advance</th>
                    <th className="px-5 py-3 text-left font-medium">Status</th>
                    <th className="px-5 py-3 text-left font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-gray-400 text-sm">No orders yet</td>
                    </tr>
                  )}
                  {recentOrders.map((order) => {
                    const sc = STATUS_COLOR[order.status] || STATUS_COLOR.pending;
                    return (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <span className="font-mono text-xs font-semibold text-[#2b3a7a]">
                            {order.orderNumber || `#${order._id?.slice(-6)}`}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-medium text-gray-800 text-xs">
                            {`${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim() || '—'}
                          </p>
                          <p className="text-gray-400 text-xs">{order.email}</p>
                        </td>
                        <td className="px-5 py-3 font-semibold text-gray-800 text-xs">
                          Rs. {order.total?.toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-xs">
                          {order.advanceAmount > 0
                            ? <span className="text-blue-700 font-medium">Rs. {order.advanceAmount?.toLocaleString()}</span>
                            : <span className="text-gray-400">COD</span>
                          }
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}