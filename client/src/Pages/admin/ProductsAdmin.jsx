import { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import Topbar from '../../components/admin/Topbar';
import api from '../../utils/api';

const AVAILABLE_SIZE_OPTIONS = [
  'New Born', '0-3M', '3-6M', '6-9M', '9-12M', '1-2Y', '2-3Y', '3-4Y', '4-5Y', '5-6Y'
];

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

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
    sku: '',
    fabric: '',
    color: '',
    makingTime: '3 - 4 Weeks',
    tags: '',
    careInstructions: '',
    disclaimer: '',
    category: '',
    status: 'active',
    isTrending: false,
    isNewArrival: false,
    isSale: false,
    salePrice: '',
    productCollection: '',
    featured: false,
    availableSizes: [],
    images: [],
    imageFiles: []
  });

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const fetchProductsAndCategories = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/admin/products'),
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

  try {
    let uploadedImages = [];

    // upload new files only
    if (formData.imageFiles?.length > 0) {
      const uploadForm = new FormData();

      formData.imageFiles.forEach(file => {
        uploadForm.append("images", file);
      });

      const uploadRes = await api.post("/admin/upload/products", uploadForm, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      uploadedImages = uploadRes.data.images;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      shortDescription: formData.shortDescription?.trim(),
      price: Number(formData.price),
      sku: formData.sku || undefined,
      fabric: formData.fabric || undefined,
      color: formData.color || undefined,
      category: formData.category,
      status: formData.status,

      isTrending: formData.isTrending,
      isNewArrival: formData.isNewArrival,
      isSale: formData.isSale,
      featured: formData.featured,

      salePrice: formData.isSale ? Number(formData.salePrice || 0) : undefined,

      availableSizes: formData.availableSizes || [],

      tags: formData.tags
        ? formData.tags.split(",").map(t => t.trim()).filter(Boolean)
        : [],

      careInstructions: formData.careInstructions
        ? formData.careInstructions.split("\n").map(t => t.trim()).filter(Boolean)
        : [],

      disclaimer: formData.disclaimer || undefined,

      productCollection: formData.productCollection || undefined,

      images: uploadedImages.length > 0
        ? uploadedImages
        : formData.images.filter(img => img.startsWith("http"))
    };

    if (editingProduct) {
      await api.put(`/admin/products/${editingProduct._id}`, payload);
    } else {
      await api.post("/admin/products", payload);
    }

    fetchProductsAndCategories();
    setShowForm(false);
    setEditingProduct(null);

  } catch (error) {
    console.log("ERROR:", error.response?.data || error.message);
    alert(error.response?.data?.message || "Error saving product");
  }
};

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription || '',
      price: product.price,
      sku: product.sku || '',
      fabric: product.fabric || '',
      color: product.color || '',
      makingTime: product.makingTime || '3 - 4 Weeks',
      tags: (product.tags || []).join(', '),
      careInstructions: (product.careInstructions || []).join('\n'),
      disclaimer: product.disclaimer || '',
      category: product.category?._id || product.category || '',
      status: product.status,
      isTrending: product.isTrending || false,
      isNewArrival: product.isNewArrival9  || false,
      isSale: product.isSale || false,
      salePrice: product.salePrice || '',
      productCollection: product.productCollection || '',
      featured: product.featured || false,
      images: product.images || [],
      imageFiles: []
    });
    setShowForm(true);
  };

  const handleMainImageChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    if (!newFiles.length) return;

    setFormData((prev) => {
      const mergedFiles = [...(prev.imageFiles || []), ...newFiles].slice(0, 5);
      if (mergedFiles.length > 5) {
        alert('You can upload up to 5 main images. Only the first 5 files were accepted.');
      }
      const previews = mergedFiles.map((file) => URL.createObjectURL(file));
      return {
        ...prev,
        imageFiles: mergedFiles,
        images: previews,
      };
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/admin/products/${id}`);
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
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">SKU</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tags</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      className="w-full p-2 border rounded"
                      placeholder="Enter comma-separated tags"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Fabric</label>
                    <input
                      type="text"
                      value={formData.fabric}
                      onChange={(e) => setFormData({...formData, fabric: e.target.value})}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Color</label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Making Time</label>
                    <input
                      type="text"
                      value={formData.makingTime}
                      onChange={(e) => setFormData({...formData, makingTime: e.target.value})}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Available Sizes</label>
                  <select
                    multiple
                    value={formData.availableSizes}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
                      setFormData({ ...formData, availableSizes: selected });
                    }}
                    className="w-full p-2 border rounded h-40"
                  >
                    {AVAILABLE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-gray-500">Hold Ctrl (or Cmd) to select multiple sizes.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Care Instructions</label>
                  <textarea
                    value={formData.careInstructions}
                    onChange={(e) => setFormData({...formData, careInstructions: e.target.value})}
                    className="w-full p-2 border rounded"
                    rows="3"
                    placeholder="Enter care instructions, one per line"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Disclaimer</label>
                  <textarea
                    value={formData.disclaimer}
                    onChange={(e) => setFormData({...formData, disclaimer: e.target.value})}
                    className="w-full p-2 border rounded"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Images (Max 5)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleMainImageChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-[#1a1208] file:text-white"
                  />
                  {formData.images?.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {formData.images.map((img, idx) => (
                        <img key={idx} src={img} alt={`Image ${idx + 1}`} className="h-24 w-full object-cover rounded-lg border" />
                      ))}
                    </div>
                  )}
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
                        sku: '',
                        fabric: '',
                        color: '',
                        availableSizes: [],
                        makingTime: '3 - 4 Weeks',
                        tags: '',
                        careInstructions: '',
                        disclaimer: '',
                        category: '',
                        status: 'active',
                        isTrending: false,
                        isNewArrival: false,
                        isSale: false,
                        salePrice: '',
                        productCollection: '',
                        featured: false,
                        images: [],
                        imageFiles: []
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
                  <th className="px-4 py-2 text-left">Images</th>
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
                    <td className="px-4 py-2">
                      <div className="flex gap-1 flex-wrap">
                        {product.images.slice(0, 3).map((img, idx) => (
                          <img key={idx} src={img} alt={`Image ${idx + 1}`} className="h-10 w-10 object-cover rounded border" />
                        ))}
                        {product.images.length > 3 && <span className="text-xs text-gray-500 ml-1">+{product.images.length - 3}</span>}
                      </div>
                    </td>
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