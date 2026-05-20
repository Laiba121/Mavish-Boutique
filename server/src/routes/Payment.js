import express from 'express';
import { payfastReturn, payfastWebhook, disabledPaymentWebhook } from '../controller/checkoutController.js';

const router = express.Router();

router.post('/payfast/webhook', express.urlencoded({ extended: true }), payfastWebhook);
router.get('/payfast/webhook', payfastWebhook);
router.get('/payfast/return/:result/:orderId', payfastReturn);
router.post('/payfast/return/:result/:orderId', express.urlencoded({ extended: true }), payfastReturn);
router.get('/payfast/return/:result', payfastReturn);
router.post('/payfast/return/:result', express.urlencoded({ extended: true }), payfastReturn);

// Legacy endpoint kept alive so old gateway webhook calls don't crash the server
router.post('/legacy/webhook', disabledPaymentWebhook);

export default router;
