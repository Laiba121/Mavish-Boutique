import mongoose from 'mongoose';
import Order from '../model/Order.js';
import Product from '../model/Product.js';
import jwt from 'jsonwebtoken';
import { sendOrderConfirmation } from '../utils/Mailer.js';

async function getPaymob() {
  try { return await import('../services/paymobService.js'); }
  catch (e) { console.warn('[paymob] service not available:', e.message); return null; }
}

/* ─────────────────────────────────────────────
   PLACE ORDER + INITIATE PAYMOB PAYMENT
───────────────────────────────────────────── */
export async function placeOrder(req, res) {
  // Strip any raw card data immediately — never stored
  delete req.body.card;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      email, firstName, lastName, address, apartment,
      city, postalCode, phone, saveInfo,
      shippingMethod = 'Standard', shippingCost = 380,
      advanceMethod, billingOption,
      billFirstName, billLastName, billAddress,
      billApartment, billCity, billPostal, billPhone,
      items, note,
    } = req.body;

    const normalizedEmail = email?.toLowerCase().trim();

    // ── USER ID ──
    let userId = req.user?._id || req.headers['x-user-id'] || null;
    if (!userId && req.headers.authorization) {
      const token = req.headers.authorization.startsWith('Bearer ')
        ? req.headers.authorization.slice(7) : null;
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded._id || decoded.id || decoded.userId;
        } catch { userId = null; }
      }
    }

    // ── VALIDATION ──
    if (!email || !firstName || !lastName || !address || !city || !phone) {
      await session.abortTransaction(); session.endSession();
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      await session.abortTransaction(); session.endSession();
      return res.status(400).json({ message: 'Cart is empty.' });
    }
    if (!['card', 'easypaisa', 'jazzcash', 'bank'].includes(advanceMethod)) {
      await session.abortTransaction(); session.endSession();
      return res.status(400).json({ message: 'Invalid payment method.' });
    }

    // ── LOAD PRODUCTS ──
    const productIds = items.map(i => i.productId);
    const products   = await Product.find({ _id: { $in: productIds } }).session(session);
    const productMap = {};
    products.forEach(p => (productMap[p._id.toString()] = p));

    // ── STOCK CHECK ──
    for (const item of items) {
      const product = productMap[item.productId];
      if (!product) { await session.abortTransaction(); session.endSession(); return res.status(404).json({ message: `Product not found: ${item.productId}` }); }
      const stock = product.stock ?? product.quantity ?? 999999;
      if (stock < item.quantity) { await session.abortTransaction(); session.endSession(); return res.status(409).json({ message: `Insufficient stock: ${product.name}` }); }
    }

    // ── REDUCE STOCK ──
    for (const item of items) {
      await Product.updateOne({ _id: item.productId }, { $inc: { stock: -item.quantity } }, { session });
    }

    // ── CALCULATE TOTAL ──
    let subtotal = 0;
    const orderItems = items.map(item => {
      const product = productMap[item.productId];
      const price   = product.isSale ? product.salePrice : product.price;
      subtotal += price * item.quantity;
      return { product: product._id, name: product.name, image: product.images?.[0] || '', size: item.size, price, quantity: item.quantity };
    });

    const total         = subtotal + shippingCost;
    const advanceAmount = Math.ceil(total / 2);
    const codAmount     = total - advanceAmount;

    // ── ADDRESSES ──
    const shippingAddress = { firstName, lastName, address, apartment, city, postalCode, phone };
    let billingAddress = shippingAddress;
    if (billingOption === 'different' && billFirstName && billLastName && billAddress && billCity && billPhone) {
      billingAddress = { firstName: billFirstName, lastName: billLastName, address: billAddress, apartment: billApartment, city: billCity, postalCode: billPostal, phone: billPhone };
    }

    // ── CREATE ORDER ──
    const [order] = await Order.create([{
      user:          userId ? new mongoose.Types.ObjectId(userId) : null,
      email:         normalizedEmail,
      shippingAddress, billingAddress,
      items:         orderItems,
      subtotal, shippingCost, total, shippingMethod,
      paymentMethod: 'hybrid_cod',
      advanceMethod,
      advanceAmount,
      codAmount,
      paymentStatus: 'advance_pending',
      status:        'confirmed',
      note, saveInfo,
    }], { session });

    await session.commitTransaction();
    session.endSession();

    sendOrderConfirmation(order).catch(() => {});

    const orderId = order._id;

    // ── BANK TRANSFER — no payment gateway needed ──
    if (advanceMethod === 'bank') {
      return res.status(201).json({
        message: 'Order placed successfully',
        orderId, orderNumber: order.orderNumber,
        paymentType: 'manual',
      });
    }

    // ── PAYMOB (card / easypaisa / jazzcash) ──
    const paymob = await getPaymob();
    if (!paymob) {
      return res.status(201).json({
        message: 'Order placed. Payment gateway not configured yet — admin will contact you.',
        orderId, orderNumber: order.orderNumber,
        paymentType: 'manual',
      });
    }

    try {
      const { paymentKey, paymobOrderId, iframeId } = await paymob.createPaymobPayment({
        orderId:    orderId.toString(),
        amountPKR:  advanceAmount,
        method:     advanceMethod,
        customer: { email: normalizedEmail, firstName, lastName, address, phone, city, postalCode },
        items:      orderItems,
      });

      // Save paymob order id on our order for webhook matching
      await Order.findByIdAndUpdate(orderId, { 'payment.paymobOrderId': paymobOrderId });

      return res.status(201).json({
        message:      'Order placed successfully',
        orderId,
        orderNumber:  order.orderNumber,
        paymentType:  advanceMethod === 'card' ? 'paymob_iframe' : 'paymob_wallet',
        paymentKey,
        iframeId,     // frontend uses this to build iframe URL for card
        advanceMethod,
      });

    } catch (err) {
      console.error('[paymob init]', err.message);
      return res.status(201).json({
        message:     'Order placed but payment init failed. Please retry payment.',
        orderId, orderNumber: order.orderNumber,
        paymentType: 'manual',
      });
    }

  } catch (err) {
    try { await session.abortTransaction(); session.endSession(); } catch (_) {}
    console.error('[placeOrder]', err);
    return res.status(500).json({ message: 'Server error: ' + err.message });
  }
}

/* ─────────────────────────────────────────────
   PAYMOB WEBHOOK
   POST /api/payments/paymob/webhook
───────────────────────────────────────────── */
export async function paymobWebhook(req, res) {
  try {
    const { verifyPaymobHmac } = await import('../services/paymobService.js');
    const hmac = req.query['hmac'];

    if (!verifyPaymobHmac(req.body, hmac)) {
      console.warn('[paymob webhook] invalid HMAC');
      return res.status(400).json({ message: 'Invalid HMAC' });
    }

    const obj     = req.body.obj || req.body;
    const success = obj.success === true || obj.success === 'true';
    const paymobOrderId = obj.order?.id?.toString() || obj.order?.toString();

    if (success && paymobOrderId) {
      await Order.findOneAndUpdate(
        { 'payment.paymobOrderId': paymobOrderId },
        {
          paymentStatus:          'advance_paid',
          'payment.paymobTxnId':  obj.id,
          'payment.paymobMethod': obj.source_data?.type,
        }
      );
    }

    return res.json({ received: true });
  } catch (err) {
    console.error('[paymob webhook]', err);
    return res.status(500).json({ message: 'Webhook error' });
  }
}

/* ─────────────────────────────────────────────
   GET ORDER
───────────────────────────────────────────── */
export async function getOrder(req, res) {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name images');
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    return res.json(order);
  } catch (err) {
    console.error('[getOrder]', err);
    return res.status(500).json({ message: 'Server error.' });
  }
}

/* ─────────────────────────────────────────────
   GET USER ORDERS
───────────────────────────────────────────── */
export async function getUserOrders(req, res) {
  try {
    let userId = null, email = null;
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7) : null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded._id; email = decoded.email;
      } catch { return res.status(401).json({ message: 'Invalid token' }); }
    }
    if (!email && req.query.email) email = req.query.email.toLowerCase().trim();
    if (!userId && !email) return res.status(400).json({ message: 'Email or login required' });
    const orders = await Order.find({
      $or: [userId ? { user: userId } : null, email ? { email } : null].filter(Boolean),
    }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (err) {
    console.error('[getUserOrders]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/* ─────────────────────────────────────────────
   ATTACH GUEST ORDERS
───────────────────────────────────────────── */
export async function attachGuestOrders(req, res) {
  try {
    const userId = req.user?._id;
    const email  = req.body.email?.toLowerCase().trim();
    if (!userId || !email) return res.status(400).json({ message: 'Missing data' });
    const result = await Order.updateMany({ email, user: null }, { $set: { user: userId } });
    return res.json({ message: 'Guest orders linked', updated: result.modifiedCount });
  } catch (err) {
    console.error('[attachGuestOrders]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}