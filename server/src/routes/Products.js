import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/Cloudinary.js';

import Product from '../model/Product.js';
import Category from '../model/Category.js';
import Banner from '../model/Banner.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

//
// ─── CLOUDINARY STORAGE ──────────────────────────────
//
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage });

//
// ─── GET PRODUCTS ────────────────────────────────────
//
router.get('/', async (req, res) => {
  try {
    const { category, trending, newArrival, sale, collection, limit } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (trending === 'true') filter.isTrending = true;
    if (newArrival === 'true') filter.isNewArrival = true;
    if (sale === 'true') filter.isSale = true;
    if (collection) filter.productCollection = collection;

    let query = Product.find(filter)
      .populate('category')
      .populate('subCategory')
      .sort({ createdAt: -1 });

    if (limit) query = query.limit(parseInt(limit));

    const products = await query;
    res.json(products);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//
// ─── GET SINGLE PRODUCT ──────────────────────────────
//
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    let product = await Product.findOne({ slug })
      .populate('category')
      .populate('subCategory');

    if (!product && mongoose.Types.ObjectId.isValid(slug)) {
      product = await Product.findById(slug)
        .populate('category')
        .populate('subCategory');
    }

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json(product);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//
// ─── UPLOAD IMAGES (CLOUDINARY) ──────────────────────
//
router.post(
  '/upload',
  protect,
  adminOnly,
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'galleryImages', maxCount: 5 },
  ]),
  (req, res) => {
    try {
      const images =
        req.files?.images?.map((file) => file.path) || [];

      const galleryImages =
        req.files?.galleryImages?.map((file) => file.path) || [];

      res.json({ images, galleryImages });

    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

//
// ─── CREATE PRODUCT ─────────────────────────────────
//
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const data = { ...req.body };

    if (!data.sku) delete data.sku;

    const product = await Product.create(data);

    res.status(201).json(product);

  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(400).json({ message: err.message });
  }
});

//
// ─── UPDATE PRODUCT (FIXED FOR CLOUDINARY) ───────────
//
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    let data = { ...req.body };

    delete data.slug;
    if (!data.sku) delete data.sku;

    // ✅ KEEP ONLY CLOUDINARY URLs
    if (Array.isArray(data.images)) {
      data.images = data.images.filter(
        (img) => typeof img === 'string' && img.startsWith('http')
      );
    }

    if (Array.isArray(data.galleryImages)) {
      data.galleryImages = data.galleryImages.filter(
        (img) => typeof img === 'string' && img.startsWith('http')
      );
    }

    Object.keys(data).forEach((key) => {
      if (data[key] === undefined || data[key] === '') {
        delete data[key];
      }
    });

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      data,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(400).json({ message: err.message });
  }
});

//
// ─── DELETE PRODUCT ─────────────────────────────────
//
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;