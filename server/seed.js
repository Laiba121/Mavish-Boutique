import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './src/model/User.js';
import Product from './src/model/Product.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mehrma';

const products = [ /* keep your products array as it is */ ];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

 // 🧹 Clear everything
await User.deleteMany({});
await Product.deleteMany({});
console.log('🗑️ Cleared users & products');

// 🔥 Create ONLY ADMIN (verified)
await User.create({
  name: 'Admin',
  email: 'admin@mavish.com',
  password: 'Admin@1234',
  role: 'admin',
  isVerified: true,
});

console.log('👑 Admin created: admin@mavish.com / Admin@1234');

    // 📦 Insert products
    await Product.insertMany(products);
    console.log(`📦 ${products.length} products seeded`);

    console.log('\n✅ DONE: Only admin exists and can login');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();