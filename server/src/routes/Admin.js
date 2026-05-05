import express from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/Cloudinary.js';

import User from '../model/User.js';
import Product from '../model/Product.js';
import Order from '../model/Order.js';
import Category from '../model/Category.js';
import Contact from '../model/Contact.js';
import Settings from '../model/Settings.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();


// ─────────────────────────────────────────────────────────────
// ✅ CLOUDINARY STORAGE (BANNERS)
// ─────────────────────────────────────────────────────────────
const bannerStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'banners',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 1600, height: 800, crop: 'fill' }],
  },
});

const uploadBanner = multer({ storage: bannerStorage });


// ─────────────────────────────────────────────────────────────
// ✅ CLOUDINARY STORAGE (CATEGORIES)
// ─────────────────────────────────────────────────────────────
const categoryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'categories',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'fill' }],
  },
});

const uploadCategory = multer({ storage: categoryStorage });


// ─────────────────────────────────────────────────────────────
// ✅ UPLOAD ROUTES
// ─────────────────────────────────────────────────────────────

// Upload Banner Image
router.post(
  '/upload',
  protect,
  adminOnly,
  uploadBanner.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({
      url: req.file.path, // ✅ Cloudinary URL
    });
  }
);

// Upload Category Image
router.post(
  '/upload-category',
  protect,
  adminOnly,
  uploadCategory.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({
      url: req.file.path, // ✅ Cloudinary URL
    });
  }
);


// ─────────────────────────────────────────────────────────────
// 📊 STATS
// ─────────────────────────────────────────────────────────────
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [users, products, orders] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments(),
      Order.find()
    ]);

    const revenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);
    const pending = orders.filter(o => o.status === 'pending').length;

    res.json({ users, products, orders: orders.length, revenue, pending });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ─────────────────────────────────────────────────────────────
// 👥 USERS
// ─────────────────────────────────────────────────────────────
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// ─────────────────────────────────────────────────────────────
// 🏷️ CATEGORIES
// ─────────────────────────────────────────────────────────────
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/categories', protect, adminOnly, async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/categories/:id', protect, adminOnly, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/categories/:id', protect, adminOnly, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// Contacts
router.get('/contacts', protect, adminOnly, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/contacts/:id', protect, adminOnly, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/contacts/:id', protect, adminOnly, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json({ message: 'Contact deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Settings
router.get('/settings', protect, adminOnly, async (req, res) => {
  try {
    const settings = await Settings.find();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/settings', protect, adminOnly, async (req, res) => {
  try {
    const setting = await Settings.create(req.body);
    res.status(201).json(setting);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/settings/:id', protect, adminOnly, async (req, res) => {
  try {
    const setting = await Settings.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!setting) return res.status(404).json({ message: 'Setting not found' });
    res.json(setting);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;