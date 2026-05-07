import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  image:    { type: String },
  size:     { type: String },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const addressSchema = new mongoose.Schema({
  firstName:  { type: String, required: true },
  lastName:   { type: String, required: true },
  address:    { type: String, required: true },
  apartment:  { type: String },
  city:       { type: String, required: true },
  postalCode: { type: String },
  phone:      { type: String, required: true },
  country:    { type: String, default: 'Pakistan' },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  // ── Identity ──────────────────────────────────────────
  orderNumber: { type: String, unique: true },
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // ── Contact ───────────────────────────────────────────
  email: { type: String, required: true, lowercase: true, trim: true },

  // ── Addresses ─────────────────────────────────────────
  shippingAddress: { type: addressSchema, required: true },
  billingAddress:  { type: addressSchema },

  // ── Items ─────────────────────────────────────────────
  items: { type: [orderItemSchema], required: true },

  // ── Pricing ───────────────────────────────────────────
  subtotal:     { type: Number, required: true },
  shippingCost: { type: Number, required: true, default: 380 },
  total:        { type: Number, required: true },

  // ── Shipping ──────────────────────────────────────────
  shippingMethod: { type: String, default: 'Standard' },

  // ── Payment ───────────────────────────────────────────
  paymentMethod: {
    type: String,
    enum: ['card', 'bank', 'hybrid_cod'],   // hybrid_cod = 50% advance + 50% COD
    required: true,
  },

  // How the 50% advance was paid (only used when paymentMethod === 'hybrid_cod')
  advanceMethod: {
    type: String,
    enum: ['card', 'easypaisa', 'jazzcash', 'bank', null],
    default: null,
  },
  advanceAmount: { type: Number, default: 0 },   // Rs amount paid in advance
  codAmount:     { type: Number, default: 0 },   // Rs amount due on delivery

  paymentStatus: {
    type: String,
    // advance_pending = mobile money sent by customer, waiting for manual confirmation
    enum: ['pending', 'advance_pending', 'advance_confirmed', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },

  // ── Order status ──────────────────────────────────────
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },

  // ── Misc ──────────────────────────────────────────────
  note:     { type: String },
  saveInfo: { type: Boolean, default: false },
}, {
  timestamps: true,
});

// Auto-generate a human-readable order number on first save
orderSchema.pre('save', async function () {
  if (this.orderNumber) return;
  const count = await mongoose.model('Order').countDocuments();
  const pad   = String(count + 1).padStart(5, '0');
  const date  = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  this.orderNumber = `ORD-${date}-${pad}`;
});

export default mongoose.model('Order', orderSchema);