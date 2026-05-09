import { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import Topbar from '../../components/admin/Topbar';
import api from '../../utils/api';

// ── Size chart config (single source of truth) ────────────────────────────────
const SIZE_CHART_OPTIONS = [
  { value: 'kids',           label: 'Kids (Boys & Girls)' },
  { value: 'women_standard', label: 'Women — Shalwar Kameez / Suits' },
  { value: 'women_maxi',     label: 'Women — Maxi Dress' },
  { value: 'men_standard',   label: 'Men — Shalwar Kameez' },
  { value: 'men_western',    label: 'Men — Shirts / Pants' },
];

const SIZES_FOR_CHART = {
  kids:           ['New Born', '0-3M', '3-6M', '6-9M', '9-12M', '1-2Y', '2-3Y', '3-4Y', '4-5Y', '5-6Y', '6-7Y', '7-8Y', '8-9Y', '9-10Y', '10-11Y', '11-12Y', '12-13Y', '13-14Y'],
  women_standard: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
  women_maxi:     ['XS', 'S', 'M', 'L', 'XL', '2XL'],
  men_standard:   ['S', 'M', 'L', 'XL', '2XL'],
  men_western:    ['S', 'M', 'L', 'XL', '2XL'],
};

const EMPTY_FORM = {
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
  sizeChartType: '',
  availableSizes: [],
  images: [],
  imageFiles: [],
};

export default function ProductsAdmin() {
  const [products, setProducts]       = useState([]);
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving]           = useState(false);
  const [formData, setFormData]       = useState(EMPTY_FORM);
  const [search, setSearch]           = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/admin/products'),
        api.get('/admin/categories'),
      ]);
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── form field helpers ──────────────────────────────────────────────────────
  const set = (k) => (e) =>
    setFormData((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSizeChartTypeChange = (e) => {
    const type = e.target.value;
    setFormData((p) => ({
      ...p,
      sizeChartType: type,
      availableSizes: SIZES_FOR_CHART[type] ? [...SIZES_FOR_CHART[type]] : [],
    }));
  };

  const toggleSize = (size) => {
    setFormData((p) => ({
      ...p,
      availableSizes: p.availableSizes.includes(size)
        ? p.availableSizes.filter((s) => s !== size)
        : [...p.availableSizes, size],
    }));
  };

  const handleImageChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    if (!newFiles.length) return;
    setFormData((p) => {
      const merged = [...(p.imageFiles || []), ...newFiles].slice(0, 5);
      return {
        ...p,
        imageFiles: merged,
        images: merged.map((f) => URL.createObjectURL(f)),
      };
    });
  };

  const removeImage = (idx) => {
    setFormData((p) => {
      const imgs  = p.images.filter((_, i) => i !== idx);
      const files = (p.imageFiles || []).filter((_, i) => i !== idx);
      return { ...p, images: imgs, imageFiles: files };
    });
  };

  // ── submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let uploadedImages = [];

      if (formData.imageFiles?.length > 0) {
        const fd = new FormData();
        formData.imageFiles.forEach((f) => fd.append('images', f));
        const res = await api.post('/admin/upload/products', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedImages = res.data.images;
      }

      const payload = {
        name:             formData.name.trim(),
        description:      formData.description.trim(),
        shortDescription: formData.shortDescription?.trim(),
        price:            Number(formData.price),
        sku:              formData.sku || undefined,
        fabric:           formData.fabric || undefined,
        color:            formData.color || undefined,
        makingTime:       formData.makingTime,
        category:         formData.category,
        status:           formData.status,
        isTrending:       formData.isTrending,
        isNewArrival:     formData.isNewArrival,
        isSale:           formData.isSale,
        featured:         formData.featured,
        salePrice:        formData.isSale ? Number(formData.salePrice || 0) : undefined,
        availableSizes:   formData.availableSizes,
        sizeChartType:    formData.sizeChartType || null,
        tags:             formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        careInstructions: formData.careInstructions ? formData.careInstructions.split('\n').map((t) => t.trim()).filter(Boolean) : [],
        disclaimer:       formData.disclaimer || undefined,
        productCollection:formData.productCollection || undefined,
        images:           uploadedImages.length > 0
                            ? uploadedImages
                            : formData.images.filter((img) => img.startsWith('http')),
      };

      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct._id}`, payload);
      } else {
        await api.post('/admin/products', payload);
      }

      closeForm();
      fetchAll();
    } catch (err) {
      console.error('Save error:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name:             product.name,
      description:      product.description,
      shortDescription: product.shortDescription || '',
      price:            product.price,
      sku:              product.sku || '',
      fabric:           product.fabric || '',
      color:            product.color || '',
      makingTime:       product.makingTime || '3 - 4 Weeks',
      tags:             (product.tags || []).join(', '),
      careInstructions: (product.careInstructions || []).join('\n'),
      disclaimer:       product.disclaimer || '',
      category:         product.category?._id || product.category || '',
      status:           product.status,
      isTrending:       product.isTrending || false,
      isNewArrival:     product.isNewArrival || false,
      isSale:           product.isSale || false,
      salePrice:        product.salePrice || '',
      productCollection:product.productCollection || '',
      featured:         product.featured || false,
      sizeChartType:    product.sizeChartType || '',
      availableSizes:   product.availableSizes || [],
      images:           product.images || [],
      imageFiles:       [],
    });
    setShowForm(true);
    setTimeout(() => document.getElementById('product-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      fetchAll();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData(EMPTY_FORM);
  };

  // ── filtered products ───────────────────────────────────────────────────────
  const visible = products.filter((p) => {
    const q = search.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.category?.name?.toLowerCase().includes(q);
  });

  const inputCls  = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500';
  const labelCls  = 'block text-sm font-medium text-gray-700 mb-1';
  const sectionCls= 'border border-gray-200 rounded-lg p-4 space-y-4';

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar /><div className="flex-1 flex flex-col"><Topbar /><div className="p-6 text-gray-500">Loading…</div></div>
      </div>
    );
  }

  const currentSizes = SIZES_FOR_CHART[formData.sizeChartType] || [];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="p-6 overflow-y-auto flex-1">

          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-2xl font-semibold text-gray-800">Products</h1>
            <button
              onClick={() => { setShowForm(true); setEditingProduct(null); setFormData(EMPTY_FORM); }}
              className="bg-[#1a1208] hover:bg-[#2a2018] text-white px-4 py-2 rounded text-sm font-medium"
            >
              + Add Product
            </button>
          </div>

          {/* ── Form ── */}
          {showForm && (
            <div id="product-form" className="bg-white rounded-lg shadow mb-6 overflow-hidden">
              <div className="bg-[#1a1208] px-6 py-4">
                <h2 className="text-white font-semibold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">

                {/* ── Basic info ── */}
                <div className={sectionCls}>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Basic Information</h3>

                  <div>
                    <label className={labelCls}>Product Name <span className="text-red-500">*</span></label>
                    <input value={formData.name} onChange={set('name')} className={inputCls} required />
                  </div>

                  <div>
                    <label className={labelCls}>Description <span className="text-red-500">*</span></label>
                    <textarea value={formData.description} onChange={set('description')} className={inputCls} rows={4} required />
                  </div>

                  <div>
                    <label className={labelCls}>Short Description</label>
                    <input value={formData.shortDescription} onChange={set('shortDescription')} className={inputCls} placeholder="Brief summary for product cards" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Price (Rs) <span className="text-red-500">*</span></label>
                      <input type="number" value={formData.price} onChange={set('price')} className={inputCls} required />
                    </div>
                    <div>
                      <label className={labelCls}>SKU</label>
                      <input value={formData.sku} onChange={set('sku')} className={inputCls} />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Category <span className="text-red-500">*</span></label>
                    {categories.length > 0 ? (
                      <select value={formData.category} onChange={set('category')} className={inputCls} required>
                        <option value="">Select category</option>
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-2 border border-red-300 rounded bg-red-50 text-red-700 text-sm">
                        No categories found. Create a category first.
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Flags ── */}
                <div className={sectionCls}>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Labels & Status</h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { key: 'isTrending',   label: 'Trending' },
                      { key: 'isNewArrival', label: 'New Arrival' },
                      { key: 'isSale',       label: 'On Sale' },
                      { key: 'featured',     label: 'Featured' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer border border-gray-200 rounded px-3 py-2 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={formData[key]}
                          onChange={(e) => setFormData((p) => ({ ...p, [key]: e.target.checked }))}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Status</label>
                      <select value={formData.status} onChange={set('status')} className={inputCls}>
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                    {formData.isSale && (
                      <div>
                        <label className={labelCls}>Sale Price (Rs)</label>
                        <input type="number" value={formData.salePrice} onChange={set('salePrice')} className={inputCls} placeholder="Discounted price" />
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Sizes ── */}
                <div className={sectionCls}>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Sizes & Size Chart</h3>

                  <div>
                    <label className={labelCls}>Size Chart Type</label>
                    <select value={formData.sizeChartType} onChange={handleSizeChartTypeChange} className={inputCls}>
                      <option value="">— No size chart —</option>
                      {SIZE_CHART_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">
                      Choosing a type auto-fills sizes below. The size chart is shown to customers on the product page.
                    </p>
                  </div>

                  {currentSizes.length > 0 && (
                    <div>
                      <label className={labelCls}>
                        Available Sizes
                        <span className="ml-2 text-xs font-normal text-gray-400">
                          ({formData.availableSizes.length} selected — click to toggle)
                        </span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {currentSizes.map((size) => {
                          const active = formData.availableSizes.includes(size);
                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => toggleSize(size)}
                              className={`px-3 py-1.5 rounded border text-sm font-medium transition ${
                                active
                                  ? 'bg-[#1a1208] text-white border-[#1a1208]'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                              }`}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button type="button" onClick={() => setFormData((p) => ({ ...p, availableSizes: [...currentSizes] }))} className="text-xs text-blue-600 hover:underline">Select all</button>
                        <span className="text-xs text-gray-300">·</span>
                        <button type="button" onClick={() => setFormData((p) => ({ ...p, availableSizes: [] }))} className="text-xs text-red-500 hover:underline">Clear</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Details ── */}
                <div className={sectionCls}>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Product Details</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>Fabric</label>
                      <input value={formData.fabric} onChange={set('fabric')} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Color</label>
                      <input value={formData.color} onChange={set('color')} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Making Time</label>
                      <input value={formData.makingTime} onChange={set('makingTime')} className={inputCls} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Collection</label>
                      <input value={formData.productCollection} onChange={set('productCollection')} className={inputCls} placeholder="e.g. Eid Sale, Summer 2025" />
                    </div>
                    <div>
                      <label className={labelCls}>Tags</label>
                      <input value={formData.tags} onChange={set('tags')} className={inputCls} placeholder="Comma-separated: formal, eid, blue" />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Care Instructions</label>
                    <textarea value={formData.careInstructions} onChange={set('careInstructions')} className={inputCls} rows={3} placeholder="One instruction per line" />
                  </div>

                  <div>
                    <label className={labelCls}>Disclaimer</label>
                    <textarea value={formData.disclaimer} onChange={set('disclaimer')} className={inputCls} rows={2} />
                  </div>
                </div>

                {/* ── Images ── */}
                <div className={sectionCls}>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Images (Max 5)</h3>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-4 file:rounded file:border-0 file:text-sm file:bg-[#1a1208] file:text-white file:cursor-pointer"
                  />

                  {formData.images?.length > 0 && (
                    <div className="grid grid-cols-5 gap-3 mt-2">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img src={img} alt="" className="h-20 w-full object-cover rounded border" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Buttons ── */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-[#1a1208] hover:bg-[#2a2018] disabled:opacity-60 text-white px-6 py-2.5 rounded font-medium text-sm flex items-center gap-2"
                  >
                    {saving && (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                    )}
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                  <button type="button" onClick={closeForm} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2.5 rounded font-medium text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Search ── */}
          <div className="mb-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-64 focus:outline-none focus:border-gray-400"
            />
          </div>

          {/* ── Table ── */}
          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Images</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Size Chart</th>
                  <th className="px-4 py-3 text-left">Sizes</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visible.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {product.images?.slice(0, 3).map((img, i) => (
                          <img key={i} src={img} alt="" className="h-10 w-10 object-cover rounded border" />
                        ))}
                        {product.images?.length > 3 && (
                          <span className="text-xs text-gray-400 self-center ml-1">+{product.images.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[180px] truncate">{product.name}</td>
                    <td className="px-4 py-3">
                      {product.isSale && product.salePrice ? (
                        <div>
                          <span className="font-semibold text-red-600">Rs {product.salePrice}</span>
                          <span className="text-xs text-gray-400 line-through ml-1">Rs {product.price}</span>
                        </div>
                      ) : (
                        <span>Rs {product.price}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{product.category?.name || '—'}</td>
                    <td className="px-4 py-3">
                      {product.sizeChartType ? (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                          {SIZE_CHART_OPTIONS.find(o => o.value === product.sizeChartType)?.label || product.sizeChartType}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[140px]">
                        {(product.availableSizes || []).slice(0, 4).map((s) => (
                          <span key={s} className="text-[10px] border border-gray-300 rounded px-1.5 py-0.5 text-gray-600">{s}</span>
                        ))}
                        {(product.availableSizes?.length || 0) > 4 && (
                          <span className="text-[10px] text-gray-400">+{product.availableSizes.length - 4}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-700'}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-800 mr-3 text-sm font-medium">Edit</button>
                      <button onClick={() => handleDelete(product._id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-10 text-gray-400 text-sm">No products found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}