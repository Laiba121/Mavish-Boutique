import express from 'express';
import multer from 'multer';
import Order from '../model/Order.js';
import { placeOrder, getOrder, getUserOrders, attachGuestOrders } from '../controller/checkoutController.js';
import { trackOrder } from '../controller/trackingController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// ── MULTER SETUP FOR SCREENSHOT UPLOAD ──
const screenshotStorage = multer.memoryStorage();
const uploadScreenshot = multer({
  storage: screenshotStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// POST /api/checkout
router.post('/', uploadScreenshot.single('screenshot'), placeOrder);

// GET /api/checkout/track
router.get('/track', trackOrder);

// GET /api/checkout/orders/my — auth handled inside getUserOrders via x-user-id header
router.get('/orders/my', getUserOrders);

// GET /api/checkout/orders — admin all orders
router.get('/orders', protect, adminOnly, async (req, res) => {
  try {
    const { limit, status, page = 1, pageSize = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const query = Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit ? parseInt(limit) : parseInt(pageSize));
    const [orders, total] = await Promise.all([query, Order.countDocuments(filter)]);
    res.json({ orders, total, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/checkout/orders/:id
router.get('/orders/:id', getOrder);

// PUT /api/checkout/orders/:id — admin update
router.put('/orders/:id', protect, adminOnly, async (req, res) => {
  try {
    const allowed = ['status', 'paymentStatus', 'note'];
    const update = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    if (!Object.keys(update).length) return res.status(400).json({ message: 'No updatable fields.' });
    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/checkout/orders/:id — admin permanent delete
router.delete('/orders/:id', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json({ message: 'Order deleted permanently.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/attach-guest-orders', protect, attachGuestOrders);

// POST /api/checkout/payment/verify
// Deprecated gateway callback route kept for old links.
router.post('/payment/verify', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const { order_id } = req.body;
    const frontendBase = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
    return res.redirect(`${frontendBase}/order-confirmation/${order_id}?status=pending`);
  } catch (err) {
    console.error('[payment verify]', err);
    const frontendBase = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${frontendBase}?error=payment_verify_failed`);
  }
});

export default router;
