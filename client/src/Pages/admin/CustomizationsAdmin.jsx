import { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import Topbar from '../../components/admin/Topbar';
import api from '../../utils/api';

export default function CustomizationsAdmin() {
  const [customizations, setCustomizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomizations();
  }, []);

  const fetchCustomizations = async () => {
    try {
      const res = await api.get('/admin/customizations');
      setCustomizations(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching customizations:', error);
      setCustomizations([]);
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">Customizations</h1>
          <p>Manage product customizations here.</p>
          <div className="bg-white rounded shadow p-4">
            <p className="text-gray-500">Total Customizations: {customizations.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}