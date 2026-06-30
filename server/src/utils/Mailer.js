import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const brandColor = '#2b3a7a';

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
            <p style="margin:0;font-size:12px;color:#888;">© ${new Date().getFullYear()} Mavish Boutique. All rights reserved.</p>
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

  const easypaisaNumber = process.env.EASYPAISA_NUMBER;
  const easypaisaName   = process.env.EASYPAISA_NAME   || 'Mavish Boutique';
  const bankName        = process.env.BANK_NAME        || 'HBL';
  const bankTitle       = process.env.BANK_ACCOUNT_TITLE  || 'Mavish Boutique';
  const bankAccount     = process.env.BANK_ACCOUNT_NUMBER;
  const bankIban        = process.env.BANK_IBAN;

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
        Please send <strong>Rs ${amt}.00</strong> to our EasyPaisa account:<br/>
        <br/>
        📱 <strong>Number:</strong> ${easypaisaNumber}<br/>
        👤 <strong>Account Name:</strong> ${easypaisaName}<br/>
        <br/>
        Use <strong>${order.orderNumber}</strong> as the description / reference.<br/>
        Your order ships once we confirm receipt.
      </div>`;
  }

  if (order.advanceMethod === 'jazzcash') {
    return `
      <div style="background:#fff5e6;border-left:4px solid #f0830a;padding:12px 16px;margin:20px 0;font-size:14px;color:#7a3c00;">
        <strong>JazzCash – Advance Payment Required</strong><br/>
        Please send <strong>Rs ${amt}.00</strong> to our JazzCash account:<br/>
        <br/>
        📱 <strong>Number:</strong> ${easypaisaNumber}<br/>
        👤 <strong>Account Name:</strong> ${easypaisaName}<br/>
        <br/>
        Use <strong>${order.orderNumber}</strong> as the description / reference.<br/>
        Your order ships once we confirm receipt.
      </div>`;
  }

  if (order.advanceMethod === 'bank') {
    return `
      <div style="background:#fff8e1;border-left:4px solid #f0a500;padding:12px 16px;margin:20px 0;font-size:14px;color:#7a5c00;">
        <strong>Bank Transfer – Advance Payment Required</strong><br/>
        Please transfer <strong>Rs ${amt}.00</strong> to our bank account:<br/>
        <br/>
        🏦 <strong>Bank:</strong> ${bankName}<br/>
        👤 <strong>Account Title:</strong> ${bankTitle}<br/>
        🔢 <strong>Account Number:</strong> ${bankAccount}<br/>
        🌐 <strong>IBAN:</strong> ${bankIban}<br/>
        <br/>
        Use <strong>${order.orderNumber}</strong> as the payment reference.<br/>
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

  const { data, error } = await resend.emails.send({
    from:    process.env.RESEND_FROM_ORDERS || `Mavish Boutique <orders@mavishboutique.com>`,
    to:      order.email,
    subject: `Order Confirmed – ${order.orderNumber}`,
    html,
  });

  if (error) {
    console.error('Resend error (order confirmation):', error);
    throw new Error(error.message || 'Failed to send order confirmation email');
  }

  console.log('Order confirmation sent:', data?.id);
}

/**
 * Send a bank deposit alert to the admin when a customer selects Bank Transfer.
 * Admin must manually verify the transfer and mark the order as paid.
 * @param {Object} order  Mongoose Order document
 */
export async function sendBankDepositAlert(order) {
  const bankName    = process.env.BANK_NAME           || 'HBL';
  const bankTitle   = process.env.BANK_ACCOUNT_TITLE  || 'Mavish Boutique';
  const bankAccount = process.env.BANK_ACCOUNT_NUMBER;
  const bankIban    = process.env.BANK_IBAN;
  const adminEmail  = process.env.ADMIN_EMAIL;

  const advanceAmt = order.advanceAmount?.toLocaleString() ?? '—';
  const codAmt     = order.codAmount?.toLocaleString()     ?? '—';

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

  const html = wrapper(`
    <h2 style="font-family:Georgia,serif;color:#2c2c2c;margin:0 0 8px;">⚠️ Bank Deposit Pending</h2>
    <p style="color:#555;font-size:15px;line-height:1.6;">
      A customer has placed an order and selected <strong>Bank Transfer</strong> as their payment method.
      Please verify the deposit in your bank account, then mark the order as paid in the admin panel.
    </p>

    <div style="background:#fff8e1;border-left:4px solid #f0a500;padding:14px 16px;margin:20px 0;font-size:14px;color:#7a5c00;">
      <strong>Action required:</strong> Verify that <strong>Rs ${advanceAmt}.00</strong> has been transferred
      with reference <strong>${order.orderNumber}</strong>, then update payment status to
      <em>advance_confirmed</em>.
    </div>

    <p style="font-size:13px;color:#888;margin-bottom:2px;">Order number</p>
    <p style="font-size:18px;font-weight:700;color:${brandColor};margin:0 0 20px;">${order.orderNumber}</p>

    <table width="100%" style="border-collapse:collapse;margin:0 0 20px;background:#f9f9fb;border-radius:4px;overflow:hidden;">
      <tr style="background:#2b3a7a;">
        <td colspan="2" style="padding:10px 16px;font-size:12px;color:#fff;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
          Customer Details
        </td>
      </tr>
      <tr>
        <td style="padding:9px 16px;font-size:13px;color:#555;width:40%;">Name</td>
        <td style="padding:9px 16px;font-size:13px;font-weight:600;">${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</td>
      </tr>
      <tr style="background:#f5f5f5;">
        <td style="padding:9px 16px;font-size:13px;color:#555;">Email</td>
        <td style="padding:9px 16px;font-size:13px;font-weight:600;">${order.email}</td>
      </tr>
      <tr>
        <td style="padding:9px 16px;font-size:13px;color:#555;">Phone</td>
        <td style="padding:9px 16px;font-size:13px;font-weight:600;">${order.shippingAddress.phone}</td>
      </tr>
      <tr style="background:#f5f5f5;">
        <td style="padding:9px 16px;font-size:13px;color:#555;">City</td>
        <td style="padding:9px 16px;font-size:13px;font-weight:600;">${order.shippingAddress.city}</td>
      </tr>
    </table>

    <table width="100%" style="border-collapse:collapse;margin:0 0 20px;background:#f9f9fb;border-radius:4px;overflow:hidden;">
      <tr style="background:#2b3a7a;">
        <td colspan="2" style="padding:10px 16px;font-size:12px;color:#fff;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
          Payment Breakdown
        </td>
      </tr>
      <tr>
        <td style="padding:9px 16px;font-size:13px;color:#555;">Order Total</td>
        <td style="padding:9px 16px;font-size:13px;text-align:right;font-weight:700;">Rs ${order.total.toLocaleString()}.00</td>
      </tr>
      <tr style="background:#fff8e1;">
        <td style="padding:9px 16px;font-size:13px;color:#7a5c00;"><strong>Advance to verify (bank deposit)</strong></td>
        <td style="padding:9px 16px;font-size:15px;text-align:right;font-weight:700;color:#7a5c00;">Rs ${advanceAmt}.00</td>
      </tr>
      <tr style="background:#f0f9f4;">
        <td style="padding:9px 16px;font-size:13px;color:#2a7a4f;">Cash on Delivery (collect at door)</td>
        <td style="padding:9px 16px;font-size:13px;text-align:right;font-weight:700;color:#2a7a4f;">Rs ${codAmt}.00</td>
      </tr>
    </table>

    <table width="100%" style="border-collapse:collapse;margin:0 0 20px;background:#f9f9fb;border-radius:4px;overflow:hidden;">
      <tr style="background:#2b3a7a;">
        <td colspan="2" style="padding:10px 16px;font-size:12px;color:#fff;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
          Your Bank Account (for reference)
        </td>
      </tr>
      <tr>
        <td style="padding:9px 16px;font-size:13px;color:#555;width:40%;">Bank</td>
        <td style="padding:9px 16px;font-size:13px;font-weight:600;">${bankName}</td>
      </tr>
      <tr style="background:#f5f5f5;">
        <td style="padding:9px 16px;font-size:13px;color:#555;">Account Title</td>
        <td style="padding:9px 16px;font-size:13px;font-weight:600;">${bankTitle}</td>
      </tr>
      <tr>
        <td style="padding:9px 16px;font-size:13px;color:#555;">Account Number</td>
        <td style="padding:9px 16px;font-size:13px;font-weight:600;">${bankAccount}</td>
      </tr>
      <tr style="background:#f5f5f5;">
        <td style="padding:9px 16px;font-size:13px;color:#555;">IBAN</td>
        <td style="padding:9px 16px;font-size:13px;font-weight:600;">${bankIban}</td>
      </tr>
      <tr>
        <td style="padding:9px 16px;font-size:13px;color:#555;">Expected Reference</td>
        <td style="padding:9px 16px;font-size:13px;font-weight:700;color:${brandColor};">${order.orderNumber}</td>
      </tr>
    </table>

    <table width="100%" style="border-collapse:collapse;margin:0 0 8px;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#666;">Item</th>
          <th style="padding:10px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#666;">Qty</th>
          <th style="padding:10px 12px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#666;">Price</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <p style="font-size:12px;color:#aaa;margin-top:24px;line-height:1.6;">
      This is an automated alert. Once you confirm the bank transfer, update the order in your admin panel:
      <strong>Orders → #${order.orderNumber} → Payment Status → advance_confirmed</strong>.
    </p>
  `);

  const { data, error } = await resend.emails.send({
    from:    process.env.RESEND_FROM_ORDERS || `Mavish Boutique <orders@mavishboutique.com>`,
    to:      adminEmail,
    subject: `⚠️ Bank Deposit Pending – ${order.orderNumber} (Rs ${advanceAmt}.00)`,
    html,
  });

  if (error) {
    console.error('Resend error (bank deposit alert):', error);
    throw new Error(error.message || 'Failed to send bank deposit alert email');
  }

  console.log('Bank deposit alert sent:', data?.id);
}