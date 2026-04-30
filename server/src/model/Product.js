import mongoose from 'mongoose';

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, trim: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  costPrice: { type: Number },
  images: [{ type: String }],
  galleryImages: [{ type: String }],
  variants: [{
    size: { type: String },
    color: { type: String },
    stock: { type: Number, default: 0 }
  }],
  totalStock: { type: Number, default: 0 },
  sku: { type: String, unique: true },
  stockStatus: { type: String, enum: ['in_stock', 'out_of_stock'], default: 'in_stock' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  customizations: [{
    title: { type: String },
    price: { type: Number },
    inputType: { type: String, enum: ['text', 'dropdown', 'file'] },
    options: [{ type: String }] // for dropdown
  }],
  enableCustomization: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'draft'], default: 'active' },
  featured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isSale: { type: Boolean, default: false },
  salePrice: { type: Number },
  productCollection: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

productSchema.pre('save', async function (next) {
  if (!this.slug && this.name) {
    const baseSlug = slugify(this.name);
    let slug = baseSlug;
    let suffix = 0;

    while (await mongoose.models.Product.exists({ slug, _id: { $ne: this._id } })) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    this.slug = slug;
  }
  next();
});

export default mongoose.model('Product', productSchema);