import { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import Topbar from '../../components/admin/Topbar';
import api from '../../utils/api';

export default function CustomersAdmin() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/admin/users');
      setCustomers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATE USER STATUS (BLOCK / ACTIVE)
  const handleStatusChange = async (userId, newStatus) => {
    try {
      await api.put(`/admin/users/${userId}`, {
        status: newStatus,
      });

      fetchCustomers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  // ❌ DELETE USER
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

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
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <div className="p-6 overflow-y-auto">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            Customers
          </h1>

          <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Phone</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Joined</th>
                  <th className="px-4 py-2 text-left">Action</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr key={customer._id} className="border-t">
                    {/* NAME */}
                    <td className="px-4 py-2 font-medium">
                      {customer.name || '-'}
                    </td>

                    {/* EMAIL */}
                    <td className="px-4 py-2">
                      {customer.email || '-'}
                    </td>

                    {/* PHONE */}
                    <td className="px-4 py-2">
                      {customer.phone || 'N/A'}
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-2">
                      {isAdmin ? (
                        <select
                          value={customer.status || 'active'}
                          onChange={(e) =>
                            handleStatusChange(
                              customer._id,
                              e.target.value
                            )
                          }
                          className="p-1 border rounded text-sm"
                        >
                          <option value="active">Active</option>
                          <option value="blocked">Blocked</option>
                        </select>
                      ) : (
                        <span
                          className={`text-sm font-semibold ${
                            customer.status === 'blocked'
                              ? 'text-red-600'
                              : 'text-green-600'
                          }`}
                        >
                          {customer.status || 'active'}
                        </span>
                      )}
                    </td>

                    {/* JOINED */}
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {customer.createdAt
                        ? new Date(customer.createdAt).toLocaleDateString()
                        : '-'}
                    </td>

                    {/* ACTION */}
                    <td className="px-4 py-2">
                      {customer.role === 'admin' ? (
                        <span className="text-xs text-gray-400">
                          Admin
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            handleDeleteUser(customer._id)
                          }
                          className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {customers.length === 0 && (
            <div className="mt-4 text-gray-500 text-sm">
              No customers found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}