import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  image: { type: String, required: true },
  title: { type: String },
  subtitle: { type: String },
  buttonText: { type: String },
  buttonLink: { type: String },
  type: { type: String, enum: ['hero', 'promo'], default: 'promo' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Banner', bannerSchema);