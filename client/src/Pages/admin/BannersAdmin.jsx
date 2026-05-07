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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);

    try {
      const data = new FormData();
      data.append('image', file);

      const res = await api.post('/admin/banners/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const imageUrl = res.data.image;

      setFormData((prev) => ({ ...prev, image: imageUrl }));
      setPreviewUrl(imageUrl);

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Image upload failed');
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
      alert('Please select image');
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
      console.error(error);
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
    if (!confirm('Delete this banner?')) return;

    try {
      await api.delete(`/admin/banners/${id}`);
      fetchBanners();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <div className="p-4 sm:p-6">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">

      {/* Sidebar (stacks on mobile, fixed on desktop) */}
      <div className="w-full md:w-auto">
        <Sidebar />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        <Topbar />

        <div className="p-4 sm:p-6 overflow-y-auto flex-1">

          <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
            Banners
          </h1>

          {/* FORM */}
          <div className="bg-white p-4 sm:p-6 rounded shadow mb-6">

            <h2 className="text-lg font-semibold mb-4">
              {editingBanner ? 'Edit Banner' : 'Add Banner'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* IMAGE */}
              <div>
                <label className="block mb-2 text-sm font-medium">Image</label>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-3 sm:p-4 cursor-pointer text-center"
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      className="max-h-48 sm:max-h-64 mx-auto object-cover"
                    />
                  ) : (
                    <p className="text-gray-400 text-sm">Click to upload image</p>
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

              <input
                type="text"
                placeholder="Banner Link"
                value={formData.buttonLink}
                onChange={(e) =>
                  setFormData({ ...formData, buttonLink: e.target.value })
                }
                className="w-full p-2 border rounded text-sm sm:text-base"
              />

              {/* TYPE + STATUS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="p-2 border rounded text-sm sm:text-base"
                >
                  <option value="hero">Hero</option>
                  <option value="promo">Promo</option>
                </select>

                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="p-2 border rounded text-sm sm:text-base"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

              </div>

              {/* BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-2">

                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-black text-white px-4 py-2 rounded text-sm sm:text-base"
                >
                  {editingBanner ? 'Update' : 'Create'}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 px-4 py-2 rounded text-sm sm:text-base"
                >
                  Clear
                </button>

              </div>
            </form>
          </div>

{/* TABLE */}
<div className="bg-white p-3 sm:p-4 rounded shadow">

  <p className="mb-4 text-sm">Total: {banners.length}</p>

  {/* DESKTOP TABLE */}
  <div className="hidden md:block overflow-x-auto">
    <table className="w-full text-sm min-w-[700px]">

      <thead>
        <tr className="bg-gray-100">
          <th className="p-2 text-left">Image</th>
          <th className="p-2 text-left">Link</th>
          <th className="p-2 text-center">Type</th>
          <th className="p-2 text-center">Status</th>
          <th className="p-2 text-center">Actions</th>
        </tr>
      </thead>

      <tbody>
        {banners.map((b) => (
          <tr key={b._id} className="border-t">

            <td className="p-2">
              <img
                src={b.image}
                className="w-20 h-12 object-cover rounded"
              />
            </td>

            <td className="p-2 break-all">
              {b.buttonLink || '-'}
            </td>

            <td className="p-2 text-center">{b.type}</td>

            <td className="p-2 text-center">
              {b.status === 'active' ? 'Active' : 'Inactive'}
            </td>

            <td className="p-2 text-center space-x-2">
              <button
                onClick={() => handleEdit(b)}
                className="text-blue-600"
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
      </tbody>

    </table>
  </div>

  {/* MOBILE CARDS */}
  <div className="md:hidden space-y-3">

    {banners.map((b) => (
      <div
        key={b._id}
        className="border rounded-lg p-3 shadow-sm bg-gray-50"
      >

        <img
          src={b.image}
          className="w-full h-40 object-cover rounded mb-2"
        />

        <p className="text-xs text-gray-500">Link</p>
        <p className="text-sm break-all mb-2">
          {b.buttonLink || '-'}
        </p>

        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">{b.type}</span>
          <span
            className={
              b.status === 'active'
                ? 'text-green-600'
                : 'text-red-500'
            }
          >
            {b.status}
          </span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleEdit(b)}
            className="text-blue-600 text-sm"
          >
            Edit
          </button>

          <button
            onClick={() => handleDelete(b._id)}
            className="text-red-500 text-sm"
          >
            Delete
          </button>
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