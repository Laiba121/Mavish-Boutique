import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String }],
  hoverImage: { type: String },
  category: { type: String, enum: ['Girls', 'Women', 'Boys', 'Men', 'Accessories'], required: true },
  subCategory: { type: String },
  sizes: [{ type: String }],
  stock: { type: Number, default: 10 },
  isTrending: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isSale: { type: Boolean, default: false },
  salePrice: { type: Number },
  collection: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Product', productSchema);