import mongoose from 'mongoose';
import Order from '../model/Order.js';
import Product from '../model/Product.js';
import { sendOrderConfirmation } from '../utils/Mailer.js';

/**
 * POST /api/checkout
 * Places an order with 50% advance + 50% COD payment model.
 */
export async function placeOrder(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      email,
      firstName, lastName, address, apartment, city, postalCode, phone,
      saveInfo,
      shippingMethod = 'Standard',
      shippingCost   = 380,
      paymentMethod  = 'hybrid_cod',   // always 'hybrid_cod' in this flow
      advanceMethod,                   // 'card' | 'easypaisa' | 'jazzcash' | 'bank'
      advanceAmount,                   // should equal Math.ceil(total / 2)
      codAmount,                       // remaining 50%
      billingOption,
      billFirstName, billLastName, billAddress, billApartment,
      billCity, billPostal, billPhone,
      items,
      note,
    } = req.body;

    // ── 1. Basic validation ───────────────────────────────────────────────────
    if (!email || !firstName || !lastName || !address || !city || !phone) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Missing required delivery fields.' });
    }
    if (!['card', 'easypaisa', 'jazzcash', 'bank'].includes(advanceMethod)) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Invalid advance payment method.' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Cart is empty.' });
    }

    // ── 2. Load products + validate stock ────────────────────────────────────
    const productIds = items.map((i) => i.productId);
    const products   = await Product.find({ _id: { $in: productIds } }).session(session);

    const productMap = {};
    products.forEach((p) => { productMap[p._id.toString()] = p; });

    for (const item of items) {
      const product = productMap[item.productId];
      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      let currentStock;
      if (product.stock && typeof product.stock === 'object' && item.size) {
        currentStock = product.stock.get
          ? product.stock.get(item.size)
          : product.stock[item.size];
      } else {
        currentStock = product.stock ?? product.quantity ?? Infinity;
      }

      if (currentStock !== undefined && currentStock < item.quantity) {
        await session.abortTransaction();
        return res.status(409).json({
          message: `Insufficient stock for "${product.name}"${item.size ? ` (size ${item.size})` : ''}.`,
        });
      }
    }

    // ── 3. Reduce stock ───────────────────────────────────────────────────────
    for (const item of items) {
      const product = productMap[item.productId];
      if (product.stock && typeof product.stock === 'object' && item.size) {
        await Product.updateOne(
          { _id: product._id },
          { $inc: { [`stock.${item.size}`]: -item.quantity } },
          { session }
        );
      } else {
        await Product.updateOne(
          { _id: product._id },
          { $inc: { stock: -item.quantity } },
          { session }
        );
      }
    }

    // ── 4. Re-derive prices from DB ───────────────────────────────────────────
    let subtotal = 0;
    const orderItems = items.map((item) => {
      const product = productMap[item.productId];
      const price   = product.isSale && product.salePrice ? product.salePrice : product.price;
      subtotal += price * item.quantity;
      return {
        product:  product._id,
        name:     product.name,
        image:    product.images?.[0] || '',
        size:     item.size,
        price,
        quantity: item.quantity,
      };
    });
    const total          = subtotal + Number(shippingCost);
    const computedAdvance = Math.ceil(total / 2);
    const computedCod    = total - computedAdvance;

    // ── 5. Build addresses ────────────────────────────────────────────────────
    const shippingAddress = { firstName, lastName, address, apartment, city, postalCode, phone };
    const billingAddress  = billingOption === 'different'
      ? { firstName: billFirstName, lastName: billLastName, address: billAddress,
          apartment: billApartment, city: billCity, postalCode: billPostal, phone: billPhone }
      : null;

    // ── 6. Create order ───────────────────────────────────────────────────────
    const [order] = await Order.create([{
      user:            req.session?.userId || null,
      email,
      shippingAddress,
      billingAddress,
      items:           orderItems,
      subtotal,
      shippingCost:    Number(shippingCost),
      total,
      shippingMethod,
      paymentMethod:   'hybrid_cod',
      advanceMethod,
      advanceAmount:   computedAdvance,
      codAmount:       computedCod,
      // advance is pending until confirmed externally (card gateway / manual mobile money check)
      paymentStatus:   advanceMethod === 'card' ? 'pending' : 'advance_pending',
      status:          'confirmed',
      note,
      saveInfo,
    }], { session });

    // ── 7. Commit ─────────────────────────────────────────────────────────────
    await session.commitTransaction();
    session.endSession();

    // ── 8. Send confirmation email (non-blocking) ─────────────────────────────
    sendOrderConfirmation(order).catch((err) =>
      console.error('[mailer] Confirmation email failed:', err)
    );

    return res.status(201).json({
      message:     'Order placed successfully.',
      orderNumber: order.orderNumber,
      orderId:     order._id,
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('[checkout] placeOrder error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}

/**
 * GET /api/checkout/orders/:id
 */
export async function getOrder(req, res) {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name images');
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    // Guest orders (user=null) are accessible by order ID alone — the Mongo ID
    // acts as an unguessable token for the confirmation page.
    const isGuest = !order.user;
    const isOwner = order.user && order.user.toString() === req.session?.userId;
    const isAdmin = req.session?.role === 'admin';
    if (!isGuest && !isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorised.' });
    }

    return res.json(order);
  } catch (err) {
    console.error('[checkout] getOrder error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
}

/**
 * GET /api/checkout/orders
 */
export async function getUserOrders(req, res) {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }
    const orders = await Order.find({ user: req.session.userId })
      .sort({ createdAt: -1 })
      .select('orderNumber total status paymentMethod advanceMethod advanceAmount codAmount createdAt items');
    return res.json(orders);
  } catch (err) {
    console.error('[checkout] getUserOrders error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
}