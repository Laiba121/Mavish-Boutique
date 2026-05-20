import crypto from 'crypto';

const TOKEN_URL =
  process.env.PAYFAST_TOKEN_URL ||
  'https://ipguat.apps.net.pk/Ecommerce/api/Transaction/GetAccessToken';
const CHECKOUT_URL =
  process.env.PAYFAST_CHECKOUT_URL ||
  'https://ipguat.apps.net.pk/Ecommerce/api/Transaction/PostTransaction';

const MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || '';
const SECURED_KEY = process.env.PAYFAST_SECURED_KEY || '';
const MERCHANT_NAME = process.env.PAYFAST_MERCHANT_NAME || 'Mehrma Boutique';
const CURRENCY_CODE = process.env.PAYFAST_CURRENCY_CODE || 'PKR';
const VERSION = process.env.PAYFAST_VERSION || 'MERCHANTCART0.1';
const PROCCODE = process.env.PAYFAST_PROCCODE || '00';
const TRAN_TYPE = process.env.PAYFAST_TRAN_TYPE || 'ECOMM_PURCHASE';
const STORE_ID = process.env.PAYFAST_STORE_ID || '';

function formatAmount(amount) {
  return Number(amount).toFixed(2);
}

function formatDate(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-') + ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('03')) return `92-${digits.slice(1)}`;
  if (digits.startsWith('92')) return `92-${digits.slice(2)}`;
  return digits;
}

function getClientIp(req) {
  const forwarded = req?.headers?.['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req?.ip || req?.socket?.remoteAddress || '';
}

function getToken(payload) {
  return payload?.ACCESS_TOKEN || payload?.access_token || payload?.TOKEN || payload?.token;
}

async function fetchAccessToken({ basketId, amount, userAgent }) {
  if (!MERCHANT_ID || !SECURED_KEY) {
    throw new Error('PayFast: PAYFAST_MERCHANT_ID and PAYFAST_SECURED_KEY are required');
  }

  const body = new URLSearchParams({
    MERCHANT_ID,
    SECURED_KEY,
    BASKET_ID: basketId,
    TXNAMT: amount,
    CURRENCY_CODE,
  });

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': userAgent || 'Mehrma Boutique Checkout',
    },
    body,
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(`PayFast token failed: ${text}`);
  }

  const token = getToken(data);
  if (!token) {
    throw new Error(`PayFast token missing: ${text}`);
  }

  return token;
}

export async function createPayfastPayment({ order, amountPKR, customer, req, frontendBase, apiBase }) {
  const orderId = order._id.toString();
  const amount = formatAmount(amountPKR);
  const orderDate = formatDate();
  const userAgent = req?.headers?.['user-agent'] || 'Mehrma Boutique Checkout';
  const token = await fetchAccessToken({ basketId: orderId, amount, userAgent });

  const successUrl = `${apiBase}/payments/payfast/return/success/${orderId}`;
  const failureUrl = `${apiBase}/payments/payfast/return/failure/${orderId}`;
  const notifyUrl = `${apiBase}/payments/payfast/webhook`;

  const fields = {
    CURRENCY_CODE,
    MERCHANT_ID,
    MERCHANT_NAME,
    TOKEN: token,
    SUCCESS_URL: successUrl,
    FAILURE_URL: failureUrl,
    CHECKOUT_URL: notifyUrl,
    CUSTOMER_EMAIL_ADDRESS: customer.email,
    CUSTOMER_MOBILE_NO: normalizePhone(customer.phone),
    CUSTOMER_NAME: `${customer.firstName} ${customer.lastName}`.trim(),
    TXNAMT: amount,
    BASKET_ID: orderId,
    ORDER_DATE: orderDate,
    SIGNATURE: crypto.randomUUID(),
    VERSION,
    TXNDESC: `Mehrma Boutique order ${order.orderNumber}`,
    PROCCODE,
    TRAN_TYPE,
    Transaction_Instrument: ['easypaisa', 'jazzcash'].includes(order.advanceMethod) ? '4' : '3',
    MERCHANT_USERAGENT: userAgent,
    CUSTOMER_IPADDRESS: getClientIp(req),
    COUNTRY: 'PK',
    SHIPPING_CUSTOMER_NAME: `${customer.firstName} ${customer.lastName}`.trim(),
    SHIPPING_ADDRESS_1: customer.address || '',
    SHIPPING_ADDRESS_CITY: customer.city || '',
    SHIPPING_POSTALCODE: customer.postalCode || '',
    SHIPPING_METHOD: order.shippingMethod || 'Standard',
    BILLING_CUSTOMER_NAME: `${customer.firstName} ${customer.lastName}`.trim(),
    BILLING_ADDRESS_1: customer.address || '',
    BILLING_ADDRESS_CITY: customer.city || '',
    BILLING_POSTALCODE: customer.postalCode || '',
  };

  if (STORE_ID) fields.STORE_ID = STORE_ID;

  order.items.forEach((item, index) => {
    fields[`ITEMS[${index}][SKU]`] = item.product?.toString() || item.name;
    fields[`ITEMS[${index}][NAME]`] = item.name;
    fields[`ITEMS[${index}][PRICE]`] = formatAmount(item.price);
    fields[`ITEMS[${index}][QTY]`] = String(item.quantity);
  });

  return {
    actionUrl: CHECKOUT_URL,
    fields,
    basketId: orderId,
    token,
    successUrl: `${frontendBase}/order-confirmation/${orderId}?status=success`,
    failureUrl: `${frontendBase}/order-confirmation/${orderId}?status=failed`,
  };
}

export function verifyPayfastResponse(params) {
  const basketId = params?.basket_id || params?.BASKET_ID || params?.order_id;
  const errCode = params?.err_code || params?.ERR_CODE || params?.errCode;
  const receivedHash = params?.validation_hash || params?.VALIDATION_HASH;

  if (!basketId || !errCode) return { valid: false, basketId, errCode };
  if (!receivedHash) return { valid: true, basketId, errCode };

  const expected = crypto
    .createHash('sha256')
    .update(`${basketId}|${SECURED_KEY}|${MERCHANT_ID}|${errCode}`)
    .digest('hex');

  return {
    valid: expected.toLowerCase() === String(receivedHash).toLowerCase(),
    basketId,
    errCode,
  };
}

export function isPayfastSuccess(errCode) {
  return ['000', '00'].includes(String(errCode || '').trim());
}
