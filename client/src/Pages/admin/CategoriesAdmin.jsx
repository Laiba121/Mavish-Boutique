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
    status: 'active'
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

      // Upload image if new one selected
      if (imageFile) {
        const formDataImg = new FormData();
        formDataImg.append('image', imageFile);

        const uploadRes = await api.post('/admin/upload/categories', formDataImg, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        imageUrl = uploadRes.data.image;
      }

      const finalData = {
        ...formData,
        image: imageUrl
      };

      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory._id}`, finalData);
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
      status: 'active'
    });
    setImageFile(null);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      status: category.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this category?')) {
      try {
        await api.delete(`/admin/categories/${id}`);
        fetchCategories();
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />

        <div className="p-6 overflow-y-auto">

          {/* HEADER */}
          <div className="flex justify-between mb-4">
            <h1 className="text-2xl font-semibold">Categories</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-black text-white px-4 py-2 rounded"
            >
              Add Category
            </button>
          </div>

          {/* FORM */}
          {showForm && (
            <div className="bg-white p-6 rounded shadow mb-6">
              <h2 className="text-xl mb-4">
                {editingCategory ? 'Edit' : 'Add'} Category
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">

                <input
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, '-')
                    })
                  }
                  className="w-full p-2 border rounded"
                  required
                />

                <input
                  type="text"
                  placeholder="Slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  required
                />

                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                {/* IMAGE */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full"
                />

                {/* PREVIEW */}
                {editingCategory?.image && !imageFile && (
                  <img
                    src={editingCategory.image}
                    className="w-20 h-20 object-cover rounded"
                  />
                )}

                <div className="flex gap-2">
                  <button className="bg-black text-white px-4 py-2 rounded">
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* TABLE */}
          <table className="w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Image</th>
                <th className="p-2">Name</th>
                <th className="p-2">Slug</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id} className="border-t text-center">
                  <td className="p-2">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        className="w-12 h-12 object-cover mx-auto rounded"
                      />
                    ) : 'No Image'}
                  </td>
                  <td>{cat.name}</td>
                  <td>{cat.slug}</td>
                  <td>{cat.status}</td>
                  <td>
                    <button onClick={() => handleEdit(cat)}>Edit</button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="ml-2 text-red-600"
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
  );
}