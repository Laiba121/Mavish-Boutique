import express from 'express';
import { placeOrder, getOrder, getUserOrders } from '../controller/checkoutController.js';
import { validateCheckout } from '../middleware/validateCheckout.js';

const router = express.Router();

// POST /api/checkout  — place a new order
router.post('/', validateCheckout, placeOrder);

// GET /api/checkout/orders  — logged-in user's order history
router.get('/orders', getUserOrders);

// GET /api/checkout/orders/:id  — single order detail
router.get('/orders/:id', getOrder);

export default router;