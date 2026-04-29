import express from 'express';
import User from '../model/User.js';
import Product from '../model/Product.js';
import Order from '../model/Order.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

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

router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;