import mongoose from 'mongoose';
import Order from '../model/Order.js';
import Product from '../model/Product.js';
import jwt from 'jsonwebtoken';
import { sendOrderConfirmation } from '../utils/Mailer.js';

/* ─────────────────────────────────────────────
   PLACE ORDER (GUEST + LOGGED IN)
───────────────────────────────────────────── */
export async function placeOrder(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
   const {
  email,
  firstName,
  lastName,
  address,
  apartment,
  city,
  postalCode,
  phone,
  saveInfo,
  shippingMethod = 'Standard',
  shippingCost = 380,
  advanceMethod,
  billingOption,
  billFirstName,
  billLastName,
  billAddress,
  billApartment,
  billCity,
  billPostal,
  billPhone,
  items,
  note,
} = req.body;

const normalizedEmail = email?.toLowerCase().trim();

    // ── USER ID (OPTIONAL FOR GUEST) ──
    let userId = req.user?._id || req.headers['x-user-id'] || null;

    if (!userId && req.headers.authorization) {
      const token = req.headers.authorization.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null;

      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded._id || decoded.id || decoded.userId;
        } catch {
          userId = null; // guest fallback
        }
      }
    }

    // ── VALIDATION ──
    if (!email || !firstName || !lastName || !address || !city || !phone) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Cart is empty.' });
    }

    // ── LOAD PRODUCTS ──
    const productIds = items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: productIds } }).session(session);

    const productMap = {};
    products.forEach(p => (productMap[p._id.toString()] = p));

    // ── STOCK CHECK ──
    for (const item of items) {
      const product = productMap[item.productId];
      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({ message: 'Product not found' });
      }

      const stock = product.stock ?? product.quantity ?? 999999;
      if (stock < item.quantity) {
        await session.abortTransaction();
        return res.status(409).json({ message: 'Insufficient stock' });
      }
    }

    // ── REDUCE STOCK ──
    for (const item of items) {
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { stock: -item.quantity } },
        { session }
      );
    }

    // ── CALCULATE TOTAL ──
    let subtotal = 0;

    const orderItems = items.map(item => {
      const product = productMap[item.productId];
      const price = product.isSale ? product.salePrice : product.price;
      subtotal += price * item.quantity;

      return {
        product: product._id,
        name: product.name,
        image: product.images?.[0] || '',
        size: item.size,
        price,
        quantity: item.quantity,
      };
    });

    const total = subtotal + shippingCost;
    const advanceAmount = Math.ceil(total / 2);
    const codAmount = total - advanceAmount;

    // ── SHIPPING ──
    const shippingAddress = {
      firstName,
      lastName,
      address,
      apartment,
      city,
      postalCode,
      phone,
    };

let billingAddress;

if (billingOption === 'different') {
  if (!billFirstName || !billLastName || !billAddress || !billCity || !billPhone) {
    // fallback instead of error (better UX)
    billingAddress = shippingAddress;
  } else {
    billingAddress = {
      firstName: billFirstName,
      lastName: billLastName,
      address: billAddress,
      apartment: billApartment,
      city: billCity,
      postalCode: billPostal,
      phone: billPhone,
    };
  }
} else {
  billingAddress = shippingAddress;
}

    // ── CREATE ORDER (FIXED GUEST SUPPORT) ──
const orderData = {
  user: userId ? new mongoose.Types.ObjectId(userId) : null,
  email: normalizedEmail,   // ✅ IMPORTANT FIX
  shippingAddress,
  items: orderItems,
  subtotal,
  shippingCost,
  total,
  shippingMethod,
  paymentMethod: 'hybrid_cod',
  advanceMethod,
  advanceAmount,
  codAmount,
  paymentStatus: 'advance_pending',
  status: 'confirmed',
  note,
  saveInfo,
};

// ✅ Only attach if exists
if (billingAddress) {
  orderData.billingAddress = billingAddress;
}

const [order] = await Order.create([orderData], { session });

    await session.commitTransaction();
    session.endSession();

    sendOrderConfirmation(order).catch(() => {});

    return res.status(201).json({
      message: 'Order placed successfully',
      orderId: order._id,
      orderNumber: order.orderNumber,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/* ─────────────────────────────────────────────
   GET ORDER (NO LOGIN REQUIRED FOR GUEST)
───────────────────────────────────────────── */
export async function getOrder(req, res) {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // ✅ PUBLIC ACCESS (NO LOGIN REQUIRED)
    return res.json(order);

  } catch (err) {
    console.error('[getOrder] error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
}

/* ─────────────────────────────────────────────
   GET USER ORDERS
───────────────────────────────────────────── */
export async function getUserOrders(req, res) {
  try {
    let userId = null;
    let email = null;

    // ✅ 1. FROM TOKEN
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded._id;
        email = decoded.email;
      } catch {
        return res.status(401).json({ message: 'Invalid token' });
      }
    }

    // ✅ 2. FROM QUERY (FOR GUEST)
    if (!email && req.query.email) {
      email = req.query.email.toLowerCase().trim();
    }

    if (!userId && !email) {
      return res.status(400).json({ message: 'Email or login required' });
    }

    // ✅ FINAL QUERY
    const orders = await Order.find({
      $or: [
        userId ? { user: userId } : null,
        email ? { email } : null,
      ].filter(Boolean),
    }).sort({ createdAt: -1 });

    return res.json(orders);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function attachGuestOrders(req, res) {
  try {
    const userId = req.user?._id;
    const email = req.body.email?.toLowerCase().trim();

    if (!userId || !email) {
      return res.status(400).json({ message: 'Missing data' });
    }

    // ✅ Update all guest orders with same email
    const result = await Order.updateMany(
      { email, user: null },
      { $set: { user: userId } }
    );

    return res.json({
      message: 'Guest orders linked',
      updated: result.modifiedCount,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}