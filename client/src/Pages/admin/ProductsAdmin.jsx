import { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import Topbar from '../../components/admin/Topbar';
import api from '../../utils/api';

export default function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    category: '',
    status: 'active',
    isTrending: false,
    isNewArrival: false,
    isSale: false,
    salePrice: '',
    productCollection: '',
    featured: false,
    imageUrls: '',
    galleryImageUrls: '',
    images: []
  });

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const fetchProductsAndCategories = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/admin/categories')
      ]);
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
      const categoriesData = Array.isArray(catRes.data) ? catRes.data : [];
      setCategories(categoriesData);
      if (categoriesData.length === 0) {
        console.warn('No categories found. Make sure categories are created in the admin panel.');
      }
    } catch (error) {
      console.error('Error fetching products or categories:', error);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      alert('Product name is required');
      return;
    }
    if (!formData.description.trim()) {
      alert('Product description is required');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      alert('Valid product price is required');
      return;
    }
    if (!formData.category) {
      alert('Please select a category');
      return;
    }
    
    // Validate that category is a valid ObjectId, not a name
    if (!isValidObjectId(formData.category)) {
      alert('Invalid category selected. Please select a category from the dropdown list.');
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      shortDescription: formData.shortDescription,
      price: Number(formData.price),
      category: formData.category,
      status: formData.status,
      isTrending: formData.isTrending,
      isNewArrival: formData.isNewArrival,
      isSale: formData.isSale,
      salePrice: formData.isSale && formData.salePrice ? Number(formData.salePrice) : undefined,
      productCollection: formData.productCollection || undefined,
      featured: formData.featured,
      images: formData.imageUrls
        ? formData.imageUrls.split(',').map((url) => url.trim()).filter(Boolean)
        : formData.images,
      galleryImages: formData.galleryImageUrls
        ? formData.galleryImageUrls.split(',').map((url) => url.trim()).filter(Boolean)
        : []
    };

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      fetchProductsAndCategories();
      setShowForm(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        status: 'active',
        isTrending: false,
        isNewArrival: false,
        isSale: false,
        salePrice: '',
        productCollection: '',
        featured: false,
        images: []
      });
    } catch (error) {
      console.error('Error saving product:', error);
      alert(`Error saving product: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription || '',
      price: product.price,
      category: product.category?._id || product.category || '',
      status: product.status,
      isTrending: product.isTrending || false,
      isNewArrival: product.isNewArrival || false,
      isSale: product.isSale || false,
      salePrice: product.salePrice || '',
      productCollection: product.productCollection || '',
      featured: product.featured || false,
      imageUrls: (product.images || []).join(', '),
      galleryImageUrls: (product.galleryImages || []).join(', '),
      images: product.images || []
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProductsAndCategories();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
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
            <h1 className="text-2xl font-semibold text-gray-800">Products</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#1a1208] text-white px-4 py-2 rounded hover:bg-[#2a2018]"
            >
              Add Product
            </button>
          </div>

          {showForm && (
            <div className="bg-white p-6 rounded shadow mb-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-2 border rounded"
                    rows="4"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Short Description</label>
                  <input
                    type="text"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
                    className="w-full p-2 border rounded"
                    placeholder="Short summary for product cards"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  {categories.length > 0 ? (
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full p-2 border border-red-300 rounded bg-red-50 text-red-700 text-sm">
                      No categories available. Please create a category first in the Categories admin page.
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full p-2 border rounded"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isTrending}
                      onChange={(e) => setFormData({...formData, isTrending: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Trending</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isNewArrival}
                      onChange={(e) => setFormData({...formData, isNewArrival: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">New Arrival</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isSale}
                      onChange={(e) => setFormData({...formData, isSale: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">On Sale</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Featured</span>
                  </label>
                </div>

                {formData.isSale && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Sale Price</label>
                    <input
                      type="number"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({...formData, salePrice: e.target.value})}
                      className="w-full p-2 border rounded"
                      placeholder="Enter sale price"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Collection (Optional)</label>
                  <input
                    type="text"
                    value={formData.productCollection}
                    onChange={(e) => setFormData({...formData, productCollection: e.target.value})}
                    className="w-full p-2 border rounded"
                    placeholder="e.g., Eid Sale, Summer 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Image URLs</label>
                  <textarea
                    value={formData.imageUrls}
                    onChange={(e) => setFormData({...formData, imageUrls: e.target.value})}
                    className="w-full p-2 border rounded"
                    rows="2"
                    placeholder="Add main image URLs separated by commas"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gallery Image URLs</label>
                  <textarea
                    value={formData.galleryImageUrls}
                    onChange={(e) => setFormData({...formData, galleryImageUrls: e.target.value})}
                    className="w-full p-2 border rounded"
                    rows="2"
                    placeholder="Add gallery image URLs separated by commas"
                  />
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="bg-[#1a1208] text-white px-4 py-2 rounded">
                    {editingProduct ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingProduct(null);
                      setFormData({
                        name: '',
                        description: '',
                        shortDescription: '',
                        price: '',
                        category: '',
                        status: 'active',
                        isTrending: false,
                        isNewArrival: false,
                        isSale: false,
                        salePrice: '',
                        productCollection: '',
                        featured: false,
                        imageUrls: '',
                        galleryImageUrls: '',
                        images: []
                      });
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Price</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-t">
                    <td className="px-4 py-2">{product.name}</td>
                    <td className="px-4 py-2">Rs. {product.price}</td>
                    <td className="px-4 py-2">{product.category?.name || product.category}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
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