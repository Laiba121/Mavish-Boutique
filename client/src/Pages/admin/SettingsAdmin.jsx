import { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import Topbar from '../../components/admin/Topbar';
import api from '../../utils/api';

export default function SettingsAdmin() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      setSettings(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setSettings([]);
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
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">Settings</h1>
          <p>Manage shipping, payment, and other settings here.</p>
          <div className="bg-white rounded shadow p-4">
            <p className="text-gray-500">Total Settings: {settings.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}