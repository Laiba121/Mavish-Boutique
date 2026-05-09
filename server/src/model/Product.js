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
  tags: [{ type: String }],
  fabric: { type: String },
  color: { type: String },
  availableSizes: [{ type: String }],
  makingTime: { type: String, default: '3 - 4 Weeks' },
  careInstructions: [{ type: String }],
  disclaimer: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
sizeChartType: {
  type: String,
  enum: ['kids', 'women_standard', 'women_maxi', 'men_standard', 'men_western'],
  default: null,
},
});

productSchema.pre('save', async function () {
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
});

productSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate();
  if (!update) return;

  const name = update.name;
  const slug = update.slug;

  if (name && !slug) {
    const baseSlug = slugify(name);
    let newSlug = baseSlug;
    let suffix = 0;

    const query = this.getQuery();
    const excludeId = query?._id;

    while (
      await mongoose.models.Product.exists({
        slug: newSlug,
        _id: { $ne: excludeId }
      })
    ) {
      suffix++;
      newSlug = `${baseSlug}-${suffix}`;
    }

    this.setUpdate({
      ...update,
      slug: newSlug
    });
  }
});

export default mongoose.model('Product', productSchema);