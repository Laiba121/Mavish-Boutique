import { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import Topbar from '../../components/admin/Topbar';
import api from '../../utils/api';

export default function BannersAdmin() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    image: '',
    title: '',
    subtitle: '',
    buttonText: '',
    buttonLink: '',
    status: 'active',
    type: 'hero'
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await api.get('/admin/banners');
      setBanners(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingBanner) {
        await api.put(`/admin/banners/${editingBanner._id}`, formData);
      } else {
        await api.post('/admin/banners', formData);
      }
      setEditingBanner(null);
      setFormData({
        image: '',
        title: '',
        subtitle: '',
        buttonText: '',
        buttonLink: '',
        status: 'active',
        type: 'hero'
      });
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      alert(`Error saving banner: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      image: banner.image || '',
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      buttonText: banner.buttonText || '',
      buttonLink: banner.buttonLink || '',
      status: banner.status || 'active',
      type: banner.type || 'hero'
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return;

    try {
      await api.delete(`/admin/banners/${id}`);
      fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
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
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Banners</h1>
              <p className="text-sm text-gray-500">Manage homepage hero and promo banners.</p>
            </div>
          </div>

          <div className="bg-white rounded shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="https://example.com/banner.jpg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Hero title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Short subtitle text"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Button Text</label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Button Link</label>
                  <input
                    type="text"
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="/products"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="hero">Hero</option>
                    <option value="promo">Promo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-[#1a1208] text-white px-4 py-2 rounded">
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingBanner(null);
                    setFormData({
                      image: '',
                      title: '',
                      subtitle: '',
                      buttonText: '',
                      buttonLink: '',
                      status: 'active',
                      type: 'hero'
                    });
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
          <div className="bg-white rounded shadow p-4 mb-6">
            <p className="text-gray-500">Total Banners: {banners.length}</p>
          </div>

          <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Image</th>
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((banner) => (
                  <tr key={banner._id} className="border-t">
                    <td className="px-4 py-2">
                      <img src={banner.image} alt={banner.title || 'Banner'} className="w-24 h-14 object-cover rounded" />
                    </td>
                    <td className="px-4 py-2">{banner.title || '—'}</td>
                    <td className="px-4 py-2 capitalize">{banner.type}</td>
                    <td className="px-4 py-2 capitalize">{banner.status}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleEdit(banner)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(banner._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}