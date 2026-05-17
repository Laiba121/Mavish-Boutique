import express from 'express';
import { paymobWebhook } from '../controller/checkoutController.js';

const router = express.Router();

// Paymob sends webhook here after payment
// POST /api/payments/paymob/webhook?hmac=XXXX
router.post('/paymob/webhook', paymobWebhook);

export default router;