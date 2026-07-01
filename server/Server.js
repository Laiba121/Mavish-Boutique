import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// ROUTES
import authRoutes from './src/routes/Auth.js';
import orderRoutes from './src/routes/Orders.js';
import adminBanner from './src/routes/admin/Banner.js'; // ✅ FIXED (MISSING BEFORE)
import userBanner from './src/routes/user/Banner.js';   // ✅ PUBLIC ROUTES (banners etc.)
import adminCategory from './src/routes/admin/Category.js'; // ✅ FIXED (MISSING BEFORE)
import userCategory from './src/routes/user/Category.js';   // ✅ PUBLIC ROUTES (categories etc.)
import uploadProduct from "./src/routes/admin/uploadProduct.js";
import uploadCategory from "./src/routes/admin/uploadCategory.js";
import adminProduct from "./src/routes/admin/Product.js";
import userProduct from "./src/routes/user/Product.js";
import checkoutRouter from './src/routes/checkout.js';
import userContact from './src/routes/user/Contact.js'; // ✅ PUBLIC ROUTES (contact form etc.)
import adminContact from './src/routes/admin/Contact.js'; // ✅ ADMIN CONTACT ROUTES (view/delete messages)
import adminUsers from './src/routes/admin/User.js'; // ✅ ADMIN USER MANAGEMENT
import sizeChartRoutes from './src/routes/sizeChartRoutes.js';
import paymentRoutes from './src/routes/Payment.js';
import sitemapRoutes from './src/routes/sitemap.js';





import Product from './src/model/Product.js';

dotenv.config();


const app = express();

// ================== FILE UPLOAD FOLDER ==================
const uploadsDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ================== MIDDLEWARE ==================
const allowedOrigins = [
  "http://localhost:5173",
  "https://mavish-frontend.onrender.com",
  "https://mavishboutique.com",
  "https://www.mavishboutique.com",
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

app.use("/", sitemapRoutes);

app.use('/uploads', express.static(uploadsDir));

// ================== ROUTES ==================
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// ✅ ADMIN ROUTES
app.use('/api/admin/banners', adminBanner);// ADMIN
app.use('/api/admin/categories', adminCategory);

app.use("/api/admin/upload/products", uploadProduct);
app.use("/api/admin/upload/categories", uploadCategory);

// ADMIN
app.use("/api/admin/products", adminProduct);
app.use("/api/admin/contacts", adminContact);
app.use('/api/admin/users', adminUsers);

// USER
app.use("/api/products", userProduct);
app.use('/api/checkout', checkoutRouter);


// ✅ PUBLIC ROUTES (IMPORTANT FOR HERO BANNER)
app.use('/api/banners', userBanner);
app.use('/api/categories', userCategory);
app.use('/api/contacts', userContact);
app.use('/api/size-charts', sizeChartRoutes);



app.use('/api/payments', paymentRoutes);


// ================== HEALTH CHECK ==================
app.get('/api/health', (_, res) => {
  res.json({
    status: 'ok',
    message: 'Mehrma Boutique API running'
  });
});

// ================== SLUG GENERATOR ==================
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

const ensureProductSlugs = async () => {
  const products = await Product.find({
    $or: [
      { slug: { $exists: false } },
      { slug: null },
      { slug: '' }
    ]
  });

  if (!products.length) return;

  for (const product of products) {
    const baseSlug = slugify(product.name || `product-${product._id}`);
    let slug = baseSlug;
    let suffix = 0;

    while (await Product.exists({ slug, _id: { $ne: product._id } })) {
      suffix++;
      slug = `${baseSlug}-${suffix}`;
    }

    product.slug = slug;
    await product.save();

    console.log(`✅ Slug generated: ${slug}`);
  }
};

// ================== DATABASE CONNECT ==================
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/mehrma';

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');

    await ensureProductSlugs();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  });
