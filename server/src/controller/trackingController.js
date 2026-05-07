import Order from '../model/Order.js';

/**
 * GET /api/checkout/track?q=<orderNumber|email>
 *
 * Public endpoint — no auth required.
 * Accepts an order number (ORD-YYYYMMDD-NNNNN) or the email used at checkout.
 * Returns safe order fields only — no billing details, no payment card info.
 */
export async function trackOrder(req, res) {
  try {
    const q = (req.query.q || '').trim().toLowerCase();

    if (!q) {
      return res.status(400).json({ message: 'Please provide an order number or email.' });
    }

    // Detect whether input looks like an order number or an email
    const isOrderNumber = /^ord-/i.test(q);

    const filter = isOrderNumber
      ? { orderNumber: { $regex: new RegExp(`^${q}$`, 'i') } }
      : { email: q };

    // When searching by email, return the most recent order
    const order = await Order.findOne(filter)
      .sort({ createdAt: -1 })
      .select(
        'orderNumber status paymentStatus paymentMethod advanceMethod ' +
        'advanceAmount codAmount subtotal shippingCost total shippingMethod ' +
        'shippingAddress items email createdAt'
      );

    if (!order) {
      return res.status(404).json({
        message: 'No order found. Please check your order number or email and try again.',
      });
    }

    return res.json(order);

  } catch (err) {
    console.error('[track] trackOrder error:', err);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
}