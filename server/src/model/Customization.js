import mongoose from 'mongoose';

const customizationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  inputType: { type: String, enum: ['text', 'dropdown', 'file'], required: true },
  options: [{ type: String }], // for dropdown
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Customization', customizationSchema);