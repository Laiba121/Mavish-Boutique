import { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import Topbar from '../../components/admin/Topbar';
import api from '../../utils/api';

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/orders?limit=5')
        ]);
        setStats(statsRes.data);
        setRecentOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setStats({});
        setRecentOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <div className="p-6">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <Topbar />

        {/* Content Area */}
        <div className="p-6 overflow-y-auto">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            Admin Dashboard
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-5 rounded shadow">
              <h3 className="text-gray-500 text-sm">Total Orders</h3>
              <p className="text-xl font-bold">{stats.orders || 0}</p>
            </div>

            <div className="bg-white p-5 rounded shadow">
              <h3 className="text-gray-500 text-sm">Total Revenue</h3>
              <p className="text-xl font-bold">Rs. {stats.revenue || 0}</p>
            </div>

            <div className="bg-white p-5 rounded shadow">
              <h3 className="text-gray-500 text-sm">Total Products</h3>
              <p className="text-xl font-bold">{stats.products || 0}</p>
            </div>

            <div className="bg-white p-5 rounded shadow">
              <h3 className="text-gray-500 text-sm">Total Customers</h3>
              <p className="text-xl font-bold">{stats.users || 0}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <div key={order._id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">Order #{order._id.slice(-6)}</p>
                    <p className="text-sm text-gray-500">{order.shippingAddress?.fullName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Rs. {order.totalAmount}</p>
                    <p className="text-sm text-gray-500">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}