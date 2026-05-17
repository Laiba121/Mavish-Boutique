import fetch from 'node-fetch';

const PAYMOB_API_KEY         = process.env.PAYMOB_API_KEY;
const PAYMOB_CARD_INTEGRATION_ID     = process.env.PAYMOB_CARD_INTEGRATION_ID;
const PAYMOB_EASYPAISA_INTEGRATION_ID = process.env.PAYMOB_EASYPAISA_INTEGRATION_ID;
const PAYMOB_JAZZCASH_INTEGRATION_ID  = process.env.PAYMOB_JAZZCASH_INTEGRATION_ID;
const PAYMOB_IFRAME_ID       = process.env.PAYMOB_IFRAME_ID; // for card embed
const CLIENT_URL             = process.env.CLIENT_URL || 'http://localhost:5173';

const BASE = 'https://pakistan.paymob.com/api';

/* ── Step 1: Get auth token ──────────────────────────────────────────── */
async function getAuthToken() {
  const res = await fetch(`${BASE}/auth/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: PAYMOB_API_KEY }),
  });
  const data = await res.json();
  if (!data.token) throw new Error('Paymob auth failed: ' + JSON.stringify(data));
  return data.token;
}

/* ── Step 2: Register order with Paymob ─────────────────────────────── */
async function registerOrder({ authToken, amountCents, orderId, items }) {
  const res = await fetch(`${BASE}/ecommerce/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token:      authToken,
      delivery_needed: false,
      amount_cents:    amountCents,
      currency:        'PKR',
      merchant_order_id: orderId.toString(),
      items: items.map(i => ({
        name:        i.name,
        amount_cents: Math.round(i.price * 100),
        description: i.name,
        quantity:    i.quantity,
      })),
    }),
  });
  const data = await res.json();
  if (!data.id) throw new Error('Paymob order registration failed: ' + JSON.stringify(data));
  return data.id; // paymob order id
}

/* ── Step 3: Get payment key for a specific integration ─────────────── */
async function getPaymentKey({ authToken, paymobOrderId, amountCents, billingData, integrationId }) {
  const res = await fetch(`${BASE}/acceptance/payment_keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token:    authToken,
      amount_cents:  amountCents,
      expiration:    3600,
      order_id:      paymobOrderId,
      billing_data:  billingData,
      currency:      'PKR',
      integration_id: integrationId,
    }),
  });
  const data = await res.json();
  if (!data.token) throw new Error('Paymob payment key failed: ' + JSON.stringify(data));
  return data.token;
}

/* ── MAIN: Create all payment tokens for an order ───────────────────── */
export async function createPaymobPayment({ orderId, amountPKR, method, customer, items }) {
  const amountCents = Math.round(amountPKR * 100);

  const billingData = {
    apartment:     'NA',
    email:         customer.email || 'guest@mehrma.pk',
    floor:         'NA',
    first_name:    customer.firstName || 'Customer',
    last_name:     customer.lastName  || 'User',
    street:        customer.address   || 'NA',
    building:      'NA',
    phone_number:  customer.phone     || '0300-0000000',
    shipping_method: 'NA',
    postal_code:   customer.postalCode || '00000',
    city:          customer.city       || 'Karachi',
    country:       'PK',
    state:         'NA',
  };

  const authToken     = await getAuthToken();
  const paymobOrderId = await registerOrder({ authToken, amountCents, orderId, items });

  // Pick integration based on method
  const integrationMap = {
    card:      PAYMOB_CARD_INTEGRATION_ID,
    easypaisa: PAYMOB_EASYPAISA_INTEGRATION_ID,
    jazzcash:  PAYMOB_JAZZCASH_INTEGRATION_ID,
  };

  const integrationId = integrationMap[method];
  if (!integrationId) throw new Error(`No integration ID configured for method: ${method}`);

  const paymentKey = await getPaymentKey({
    authToken, paymobOrderId, amountCents, billingData, integrationId,
  });

  return {
    paymentKey,
    paymobOrderId,
    iframeId: PAYMOB_IFRAME_ID, // only used for card embed
  };
}

/* ── Verify Paymob webhook HMAC ──────────────────────────────────────── */
import crypto from 'crypto';

export function verifyPaymobHmac(body, receivedHmac) {
  const HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET;

  // Paymob concatenates specific fields in alphabetical order
  const fields = [
    'amount_cents', 'created_at', 'currency', 'error_occured',
    'has_parent_transaction', 'id', 'integration_id', 'is_3d_secure',
    'is_auth', 'is_capture', 'is_refunded', 'is_standalone_payment',
    'is_voided', 'order', 'owner', 'pending',
    'source_data.pan', 'source_data.sub_type', 'source_data.type',
    'success',
  ];

  const obj = body.obj || body;
  const str = fields.map(f => {
    const keys = f.split('.');
    let val = obj;
    for (const k of keys) val = val?.[k];
    return val ?? '';
  }).join('');

  const computed = crypto
    .createHmac('sha512', HMAC_SECRET)
    .update(str)
    .digest('hex');

  return computed === receivedHmac;
}