import nodemailer from 'nodemailer';

const brandColor = '#2b3a7a';

const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

const wrapper = (body) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf7f2;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f2;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" style="background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.07);">
        <tr>
          <td style="background:#2c2c2c;padding:28px 40px;text-align:center;">
            <span style="font-family:Georgia,serif;font-size:22px;color:#fff;font-weight:700;letter-spacing:2px;">
              Mehrma Boutique
            </span>
          </td>
        </tr>
        <tr><td style="padding:40px;">${body}</td></tr>
        <tr>
          <td style="background:#f5f0eb;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#888;">© ${new Date().getFullYear()} Mehrma Boutique. All rights reserved.</p>
            <p style="margin:6px 0 0;font-size:12px;color:#888;">15-Km, Hafizabad Road, Gujranwala</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

/** Human-friendly label for the advance payment method */
function advanceMethodLabel(method) {
  return { card: 'Debit / Credit Card', easypaisa: 'EasyPaisa', jazzcash: 'JazzCash', bank: 'Bank Transfer' }[method] || method;
}

/** Build the advance payment instructions block */
function advanceInstructions(order) {
  const amt = order.advanceAmount?.toLocaleString() ?? '—';

  if (order.advanceMethod === 'card') {
    return `
      <div style="background:#e8f4fd;border-left:4px solid #2b3a7a;padding:12px 16px;margin:20px 0;font-size:14px;color:#1a3060;">
        <strong>Card Payment – Advance</strong><br/>
        Your advance of <strong>Rs ${amt}.00</strong> will be charged to your card.
        We will confirm once the payment is processed.
      </div>`;
  }

  if (order.advanceMethod === 'easypaisa') {
    return `
      <div style="background:#e8f8ee;border-left:4px solid #00a651;padding:12px 16px;margin:20px 0;font-size:14px;color:#004d25;">
        <strong>EasyPaisa – Advance Payment Required</strong><br/>
        Please send <strong>Rs ${amt}.00</strong> to our EasyPaisa account
        <strong>0300-XXXXXXX</strong> (Mehrma Boutique).<br/>
        Use <strong>${order.orderNumber}</strong> as the description / reference.<br/>
        Your order ships once we confirm receipt.
      </div>`;
  }

  if (order.advanceMethod === 'jazzcash') {
    return `
      <div style="background:#fff5e6;border-left:4px solid #f0830a;padding:12px 16px;margin:20px 0;font-size:14px;color:#7a3c00;">
        <strong>JazzCash – Advance Payment Required</strong><br/>
        Please send <strong>Rs ${amt}.00</strong> to our JazzCash account
        <strong>0300-XXXXXXX</strong> (Mehrma Boutique).<br/>
        Use <strong>${order.orderNumber}</strong> as the description / reference.<br/>
        Your order ships once we confirm receipt.
      </div>`;
  }

  if (order.advanceMethod === 'bank') {
    return `
      <div style="background:#fff8e1;border-left:4px solid #f0a500;padding:12px 16px;margin:20px 0;font-size:14px;color:#7a5c00;">
        <strong>Bank Transfer – Advance Payment Required</strong><br/>
        Please transfer <strong>Rs ${amt}.00</strong> to our bank account
        using <strong>${order.orderNumber}</strong> as the payment reference.<br/>
        Your order ships once funds clear.
      </div>`;
  }

  return '';
}

/**
 * Send an order confirmation email to the customer.
 * @param {Object} order  Mongoose Order document
 */
export async function sendOrderConfirmation(order) {
  const itemRows = order.items.map((i) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;">
        ${i.name}${i.size ? ` <span style="color:#888;font-size:12px;">(${i.size})</span>` : ''}
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;font-size:14px;">${i.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-size:14px;">
        Rs ${(i.price * i.quantity).toLocaleString()}.00
      </td>
    </tr>`).join('');

  const advanceAmt = order.advanceAmount?.toLocaleString() ?? '—';
  const codAmt     = order.codAmount?.toLocaleString()     ?? '—';

  const html = wrapper(`
    <h2 style="font-family:Georgia,serif;color:#2c2c2c;margin:0 0 8px;">Order Confirmed!</h2>
    <p style="color:#555;font-size:15px;line-height:1.6;">
      Hi <strong>${order.shippingAddress.firstName}</strong>, thank you for your order.
    </p>

    <p style="font-size:13px;color:#888;margin-bottom:2px;">Order number</p>
    <p style="font-size:18px;font-weight:700;color:${brandColor};margin:0 0 20px;">${order.orderNumber}</p>

    <!-- Payment split summary -->
    <table width="100%" style="margin:0 0 8px;border-collapse:collapse;background:#f9f9fb;border-radius:4px;overflow:hidden;">
      <tr style="background:#2b3a7a;">
        <td colspan="2" style="padding:10px 16px;font-size:12px;color:#fff;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
          Payment Summary
        </td>
      </tr>
      <tr>
        <td style="padding:10px 16px;font-size:13px;color:#555;">Advance paid (${advanceMethodLabel(order.advanceMethod)})</td>
        <td style="padding:10px 16px;font-size:13px;text-align:right;font-weight:700;color:#2b3a7a;">Rs ${advanceAmt}.00</td>
      </tr>
      <tr style="background:#f0f9f4;">
        <td style="padding:10px 16px;font-size:13px;color:#555;">Cash on Delivery (due at door)</td>
        <td style="padding:10px 16px;font-size:13px;text-align:right;font-weight:700;color:#2a7a4f;">Rs ${codAmt}.00</td>
      </tr>
    </table>

    ${advanceInstructions(order)}

    <table width="100%" style="border-collapse:collapse;margin:16px 0;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#666;">Item</th>
          <th style="padding:10px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#666;">Qty</th>
          <th style="padding:10px 12px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#666;">Price</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <table width="100%" style="margin-top:8px;">
      <tr>
        <td style="padding:4px 0;font-size:14px;color:#555;">Subtotal</td>
        <td style="padding:4px 0;font-size:14px;text-align:right;">Rs ${order.subtotal.toLocaleString()}.00</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:14px;color:#555;">Shipping (${order.shippingMethod})</td>
        <td style="padding:4px 0;font-size:14px;text-align:right;">Rs ${order.shippingCost.toLocaleString()}.00</td>
      </tr>
      <tr style="border-top:2px solid #eee;">
        <td style="padding:10px 0 4px;font-size:16px;font-weight:700;">Total</td>
        <td style="padding:10px 0 4px;font-size:16px;font-weight:700;text-align:right;color:${brandColor};">
          PKR Rs ${order.total.toLocaleString()}.00
        </td>
      </tr>
    </table>

    <div style="margin-top:28px;padding:16px;background:#f9f9f9;border-radius:4px;font-size:13px;color:#555;line-height:1.7;">
      <strong>Shipping to:</strong><br/>
      ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br/>
      ${order.shippingAddress.address}${order.shippingAddress.apartment ? ', ' + order.shippingAddress.apartment : ''}<br/>
      ${order.shippingAddress.city}${order.shippingAddress.postalCode ? ' ' + order.shippingAddress.postalCode : ''}, ${order.shippingAddress.country}<br/>
      ${order.shippingAddress.phone}
    </div>
  `);

  const transporter = createTransporter();
  await transporter.sendMail({
    from:    `"Mehrma Boutique" <${process.env.EMAIL_USER}>`,
    to:      order.email,
    subject: `Order Confirmed – ${order.orderNumber}`,
    html,
  });
}