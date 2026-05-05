import { useEffect, useRef, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import Topbar from '../../components/admin/Topbar';
import api from '../../utils/api';

export default function BannersAdmin() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [formData, setFormData] = useState({
    image: '',
    buttonLink: '',
    type: 'hero',
    status: 'active',
  });

  const fileInputRef = useRef(null);

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

  // ✅ IMAGE UPLOAD (Cloudinary)
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // temporary preview
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);

    try {
      const data = new FormData();
      data.append('image', file);

      const res = await api.post('/admin/banners/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // ✅ Cloudinary URL
      const imageUrl = res.data.image;

      setFormData((prev) => ({ ...prev, image: imageUrl }));
      setPreviewUrl(imageUrl);

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Image upload failed. Please try again.');
      setPreviewUrl('');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setEditingBanner(null);
    setPreviewUrl('');
    setFormData({
      image: '',
      buttonLink: '',
      type: 'hero',
      status: 'active',
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image) {
      alert('Please select an image first.');
      return;
    }

    try {
      if (editingBanner) {
        await api.put(`/admin/banners/${editingBanner._id}`, formData);
      } else {
        await api.post('/admin/banners', formData);
      }

      resetForm();
      fetchBanners();

    } catch (error) {
      console.error('Error saving banner:', error);
      alert(error.response?.data?.message || 'Error saving banner');
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setPreviewUrl(banner.image || '');
    setFormData({
      image: banner.image || '',
      buttonLink: banner.buttonLink || '',
      type: banner.type || 'hero',
      status: banner.status || 'active',
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

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />

        <div className="p-6 overflow-y-auto flex-1">
          <h1 className="text-2xl font-semibold mb-6">Banners</h1>

          {/* FORM */}
          <div className="bg-white p-6 rounded shadow mb-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingBanner ? 'Edit Banner' : 'Add Banner'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* IMAGE */}
              <div>
                <label className="block mb-2 text-sm font-medium">Image</label>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-4 cursor-pointer text-center"
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-64 mx-auto object-cover"
                    />
                  ) : (
                    <p className="text-gray-400">Click to upload image</p>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                {uploading && (
                  <p className="text-blue-600 text-sm mt-1">Uploading...</p>
                )}
              </div>

              {/* LINK */}
              <input
                type="text"
                placeholder="Banner Link"
                value={formData.buttonLink}
                onChange={(e) =>
                  setFormData({ ...formData, buttonLink: e.target.value })
                }
                className="w-full p-2 border rounded"
              />

              {/* TYPE + STATUS */}
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="p-2 border rounded"
                >
                  <option value="hero">Hero</option>
                  <option value="promo">Promo</option>
                </select>

                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="p-2 border rounded"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* BUTTONS */}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  {editingBanner ? 'Update' : 'Create'}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>

          {/* TABLE */}
          <div className="bg-white p-4 rounded shadow">
            <p className="mb-4">Total: {banners.length}</p>

            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Image</th>
                  <th className="p-2 text-left">Link</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>

              <tbody>
                {banners.map((b) => (
                  <tr key={b._id} className="border-t">
                    <td className="p-2">
                      <img
                        src={b.image}
                        alt=""
                        className="w-24 h-14 object-cover rounded"
                      />
                    </td>

                    <td className="p-2">{b.buttonLink || '-'}</td>

                    <td className="p-2 text-center">{b.type}</td>

                    <td className="p-2 text-center">
                      {b.status === 'active' ? 'Active' : 'Inactive'}
                    </td>

                    <td className="p-2 text-center">
                      <button
                        onClick={() => handleEdit(b)}
                        className="text-blue-600 mr-2"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(b._id)}
                        className="text-red-500"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {banners.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center p-6 text-gray-400">
                      No banners
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}