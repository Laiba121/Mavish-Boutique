import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String },
  phone:    { type: String },
  address:  { type: String },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },
  status:   { type: String, enum: ['active', 'blocked'], default: 'active' },
  totalOrders: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  googleId:   { type: String, sparse: true },
  avatar:     { type: String },
  emailOtp:       { type: String },
  emailOtpExpiry: { type: Date },
  resetOtp:       { type: String },
  resetOtpExpiry: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = async function (entered) {
  if (!this.password) return false;
  return bcrypt.compare(entered, this.password);
};

export default mongoose.model('User', userSchema);