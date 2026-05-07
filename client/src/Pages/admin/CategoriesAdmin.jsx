import { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import Topbar from '../../components/admin/Topbar';
import api from '../../utils/api';

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    status: 'active',
  });

  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/categories');
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = editingCategory?.image || '';

      if (imageFile) {
        const formDataImg = new FormData();
        formDataImg.append('image', imageFile);

        const uploadRes = await api.post(
          '/admin/upload/categories',
          formDataImg,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );

        imageUrl = uploadRes.data.image;
      }

      const finalData = {
        ...formData,
        image: imageUrl,
      };

      if (editingCategory) {
        await api.put(
          `/admin/categories/${editingCategory._id}`,
          finalData
        );
      } else {
        await api.post('/admin/categories', finalData);
      }

      fetchCategories();
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      status: 'active',
    });
    setImageFile(null);
  };

  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      status: cat.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this category?')) {
      await api.delete(`/admin/categories/${id}`);
      fetchCategories();
    }
  };

  if (loading)
    return (
      <div className="p-6 text-sm text-gray-500">
        Loading...
      </div>
    );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <div className="p-3 sm:p-5 lg:p-6 overflow-y-auto">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h1 className="text-xl sm:text-2xl font-semibold">
              Categories
            </h1>

            <button
              onClick={() => setShowForm(true)}
              className="bg-black text-white px-4 py-2 rounded-lg text-sm"
            >
              Add Category
            </button>
          </div>

          {/* FORM */}
          {showForm && (
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow mb-6">

              <h2 className="text-lg sm:text-xl mb-4 font-semibold">
                {editingCategory ? 'Edit' : 'Add'} Category
              </h2>

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >

                <input
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, '-'),
                    })
                  }
                  className="w-full p-2 border rounded-lg text-sm"
                  required
                />

                <input
                  type="text"
                  placeholder="Slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slug: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded-lg text-sm"
                  required
                />

                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded-lg text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">
                    Inactive
                  </option>
                </select>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setImageFile(e.target.files[0])
                  }
                  className="w-full text-sm"
                />

                {/* Preview */}
                {editingCategory?.image && !imageFile && (
                  <img
                    src={editingCategory.image}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  <button className="bg-black text-white px-4 py-2 rounded-lg text-sm">
                    Save
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* MOBILE CARDS */}
          <div className="grid grid-cols-1 sm:hidden gap-3">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="bg-white rounded-xl shadow p-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={cat.image || '/images/logo.avif'}
                    className="w-12 h-12 rounded-lg object-cover border"
                  />

                  <div className="flex-1">
                    <p className="font-semibold">
                      {cat.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {cat.slug}
                    </p>
                    <p className="text-xs">
                      {cat.status}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="flex-1 bg-blue-500 text-white py-1.5 rounded text-sm"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(cat._id)
                    }
                    className="flex-1 bg-red-500 text-white py-1.5 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden sm:block bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3">Image</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Slug</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {categories.map((cat) => (
                  <tr
                    key={cat._id}
                    className="border-t"
                  >
                    <td className="p-3">
                      <img
                        src={
                          cat.image ||
                          '/images/logo.avif'
                        }
                        className="w-12 h-12 rounded object-cover"
                      />
                    </td>

                    <td className="p-3 font-medium">
                      {cat.name}
                    </td>

                    <td className="p-3 text-gray-600">
                      {cat.slug}
                    </td>

                    <td className="p-3">
                      {cat.status}
                    </td>

                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleEdit(cat)
                          }
                          className="text-blue-600"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(cat._id)
                          }
                          className="text-red-600"
                        >
                          Delete
                        </button>
                      </div>
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