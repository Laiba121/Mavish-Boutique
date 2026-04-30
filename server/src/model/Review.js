import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  reviewText: { type: String },
  status: { type: String, enum: ['approved', 'pending'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Review', reviewSchema);