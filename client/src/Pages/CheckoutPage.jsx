import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingBag, ChevronDown, Lock, HelpCircle } from 'lucide-react';
import { clearCart } from '../store/cartSlice';
import { useLocation } from 'react-router-dom';

// ── Payment account details ─────────────────────────────────────────────
const EASYPAISA_NUMBER = import.meta.env.VITE_EASYPAISA_NUMBER || '0300-XXXXXXX';
const EASYPAISA_NAME   = import.meta.env.VITE_EASYPAISA_NAME   || 'Mehrma Boutique';
const JAZZCASH_NUMBER  = import.meta.env.VITE_JAZZCASH_NUMBER  || '0300-XXXXXXX';
const JAZZCASH_NAME    = import.meta.env.VITE_JAZZCASH_NAME    || 'Mehrma Boutique';
const BANK_NAME        = import.meta.env.VITE_BANK_NAME        || 'HBL';
const BANK_TITLE       = import.meta.env.VITE_BANK_ACCOUNT_TITLE  || 'Mehrma Boutique';
const BANK_ACCOUNT     = import.meta.env.VITE_BANK_ACCOUNT_NUMBER || '0123-4567890-001';
const BANK_IBAN        = import.meta.env.VITE_BANK_IBAN           || 'PK36HABB0000000000000000';

export default function CheckoutPage() {
  const navigate  = useNavigate();
  const location = useLocation();

const buyNowMode = location.state?.buyNowMode;
const buyNowItems = location.state?.buyNowItems;

const cartItems = useSelector((s) => s.cart.items);

// FINAL ITEMS DECISION
const items = buyNowMode ? buyNowItems : cartItems;
  const dispatch  = useDispatch();

  // ✅ GET LOGGED IN USER
const user = useSelector((s) => s.auth.user);

const headers = {
  'Content-Type': 'application/json',
};

if (user?.token) {
  headers['Authorization'] = `Bearer ${user.token}`;
}
if (user?._id) {
  headers['x-user-id'] = user._id;
}


  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '',
    address: '', apartment: '', city: '',
    postalCode: '', phone: '', saveInfo: false,
    advanceMethod: 'card',
    cardNumber: '', expiry: '', cvv: '', cardName: '',
    mobileNumber: '',
    billingOption: 'same',
    billFirstName: '', billLastName: '', billAddress: '',
    billApartment: '', billCity: '', billPostal: '', billPhone: '',
  });

  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');

  // ✅ PREFILL USER DATA
  useEffect(() => {
    if (user) {
      const [firstName = '', lastName = ''] = (user.name || '').split(' ');

      setForm((prev) => ({
        ...prev,
        email: user.email || '',
        firstName: user.firstName || firstName,
        lastName: user.lastName || lastName,
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
      }));
    }
  }, [user]);

  const subtotal  = items.reduce((sum, i) => {
    const price = i.isSale && i.salePrice ? i.salePrice : i.price;
    return sum + price * i.quantity;
  }, 0);

  const shipping  = subtotal > 0 ? 380 : 0;
  const total     = subtotal + shipping;
  const advance   = Math.ceil(total / 2);
  const cod       = total - advance;

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const inputCls = "w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#2b3a7a] focus:ring-1 focus:ring-[#2b3a7a] transition bg-white";
  const labelCls = "block text-xs text-gray-500 mb-1 font-medium";

  // ── Submit ─────────────────────────────────────────────────────────────
  async function handleSubmit() {
  setApiError('');
  setLoading(true);

  const payload = {
  email: form.email,
  firstName: form.firstName,
  lastName: form.lastName,
  address: form.address,
  apartment: form.apartment,
  city: form.city,
  postalCode: form.postalCode,
  phone: form.phone,
  saveInfo: form.saveInfo,
  shippingMethod: 'Standard',
  shippingCost: 380,
  paymentMethod: 'hybrid_cod',
  advanceMethod: form.advanceMethod,
  advanceAmount: advance,
  codAmount: cod,
  items: items.map((i) => ({
    productId: i._id,
    name: i.name,
    image: i.images?.[0] || '',
    size: i.size,
    price: i.isSale && i.salePrice ? i.salePrice : i.price,
    quantity: i.quantity,
    billingOption: form.billingOption, 
  })),
};

if (form.billingOption === 'different') {
  if (
    !form.billFirstName ||
    !form.billLastName ||
    !form.billAddress ||
    !form.billCity ||
    !form.billPhone
  ) {
    setApiError('Please fill complete billing address.');
    setLoading(false);
    return;
  }
}

  try {
    // ✅ FIX: include auth headers properly
    const headers = {
      'Content-Type': 'application/json',
    };

    if (user?.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }

    if (user?._id) {
      headers['x-user-id'] = user._id;
    }

    const res = await fetch('http://localhost:5000/api/checkout', {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = data.errors ? data.errors.join(' • ') : data.message;
      setApiError(msg || 'Something went wrong. Please try again.');
      setLoading(false);
      return;
    }

   // ✅ SAVE EMAIL FOR GUEST USERS
localStorage.setItem('guestEmail', form.email);

dispatch(clearCart());

navigate(`/order-confirmation/${data.orderId}`, {
  state: { orderNumber: data.orderNumber },
});

  } catch (err) {
    console.error('[checkout submit]', err);
    setApiError('Network error. Please check your connection and try again.');
    setLoading(false);
  }
}

  // ── Advance payment method options ─────────────────────────────────────────
  const advanceMethods = [
    { id: 'card',       label: 'Debit / Credit Card',  icons: ['https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png', 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg'] },
    { id: 'easypaisa',  label: 'EasyPaisa',            icons: [] },
    { id: 'jazzcash',   label: 'JazzCash',             icons: [] },
    { id: 'bank',       label: 'Bank Transfer',        icons: [] },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 w-full">
        <div className="max-w-5xl mx-auto px-6 py-3 relative flex items-center justify-center">
          <Link to="/" className="flex items-center">
            <img src="/images/logo1.png" alt="Logo" className="h-15 object-contain" onError={e => { e.target.style.display = 'none'; }} />
          </Link>
          <button onClick={() => navigate('/cart')} className="absolute right-6 text-gray-500 hover:text-gray-700 transition">
            <ShoppingBag size={22} strokeWidth={1.6} />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="flex-1 w-full space-y-6">

            {/* Breadcrumb */}
            <nav className="text-xs text-gray-400 flex items-center gap-1.5">
              <Link to="/cart" className="hover:text-[#2b3a7a] transition">Cart</Link>
              <span>›</span>
              <span className="text-gray-700 font-semibold">Information</span>
              <span>›</span>
              <span>Shipping</span>
              <span>›</span>
              <span>Payment</span>
            </nav>

            {/* Contact */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-900">Contact</h2>
                <Link to="/login" className="text-sm text-[#2b3a7a] hover:underline">Sign in</Link>
              </div>
              <input
                type="text"
                value={form.email}
                onChange={set('email')}
                placeholder="Email or mobile phone number"
                className={inputCls}
              />
            </section>

            {/* Delivery */}
            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-3">Delivery</h2>

              <div className="relative mb-3">
                <label className={labelCls}>Country/Region</label>
                <div className="relative">
                  <select value="Pakistan" readOnly className={`${inputCls} appearance-none pr-8`}>
                    <option>Pakistan</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <input value={form.firstName} onChange={set('firstName')} placeholder="First name" className={inputCls} />
                <input value={form.lastName}  onChange={set('lastName')}  placeholder="Last name"  className={inputCls} />
              </div>

              <input value={form.address}   onChange={set('address')}   placeholder="Address"                            className={`${inputCls} mb-3`} />
              <input value={form.apartment} onChange={set('apartment')} placeholder="Apartment, suite, etc. (optional)"  className={`${inputCls} mb-3`} />

              <div className="grid grid-cols-2 gap-3 mb-3">
                <input value={form.city}       onChange={set('city')}       placeholder="City"                    className={inputCls} />
                <input value={form.postalCode} onChange={set('postalCode')} placeholder="Postal code (optional)"  className={inputCls} />
              </div>

              <div className="relative mb-3">
                <input value={form.phone} onChange={set('phone')} placeholder="Phone" className={`${inputCls} pr-9`} />
                <HelpCircle size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={form.saveInfo}
                  onChange={set('saveInfo')}
                  className="w-4 h-4 rounded border-gray-300 text-[#2b3a7a] focus:ring-[#2b3a7a]"
                />
                Save this information for next time
              </label>
            </section>

            {/* Shipping method */}
            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-3">Shipping method</h2>
              <div className="border border-[#2b3a7a] rounded bg-blue-50/40 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-[#2b3a7a] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#2b3a7a]" />
                  </div>
                  <span className="text-sm text-gray-800">Standard</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">Rs 380.00</span>
              </div>
            </section>

            {/* ── Payment — 50% advance + 50% COD ── */}
            <section>
              <div className="mb-3">
                <h2 className="text-base font-semibold text-gray-900">Payment</h2>
                <p className="text-xs text-gray-400 mt-0.5">All transactions are secure and encrypted.</p>
              </div>

              {/* Payment split info banner */}
              <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4 text-sm text-blue-800">
                <strong className="block mb-2">50% Advance + 50% Cash on Delivery</strong>
                <div className="flex justify-between">
                  <span>Pay now (50% advance):</span>
                  <strong>Rs {advance.toLocaleString()}.00</strong>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Pay on delivery (50% COD):</span>
                  <strong>Rs {cod.toLocaleString()}.00</strong>
                </div>
              </div>

              {/* Advance payment method selector */}
              <p className="text-sm font-medium text-gray-700 mb-2">Choose how to pay the advance:</p>
              <div className="border border-gray-300 rounded overflow-hidden divide-y divide-gray-200">

                {advanceMethods.map(({ id, label, icons }) => (
                  <div key={id}>
                    <label className={`flex items-center justify-between px-4 py-3 cursor-pointer ${form.advanceMethod === id ? 'bg-blue-50/40' : 'bg-white'}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${form.advanceMethod === id ? 'border-[#2b3a7a]' : 'border-gray-400'}`}>
                          {form.advanceMethod === id && <div className="w-2 h-2 rounded-full bg-[#2b3a7a]" />}
                        </div>
                        <span className="text-sm text-gray-800">{label}</span>
                      </div>
                      {icons.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          {icons.map((src, i) => (
                            <img key={i} src={src} alt="" className="h-5 object-contain" />
                          ))}
                        </div>
                      )}
                      <input type="radio" name="advanceMethod" value={id} checked={form.advanceMethod === id} onChange={set('advanceMethod')} className="sr-only" />
                    </label>

                    {/* Card fields */}
                    {form.advanceMethod === 'card' && id === 'card' && (
                      <div className="px-4 pb-4 pt-3 bg-gray-50 space-y-3">
                        <div className="relative">
                          <input value={form.cardNumber} onChange={set('cardNumber')} placeholder="Card number" className={`${inputCls} pr-9`} />
                          <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input value={form.expiry} onChange={set('expiry')} placeholder="Expiration (MM / YY)" className={inputCls} />
                          <div className="relative">
                            <input value={form.cvv} onChange={set('cvv')} placeholder="Security code" className={`${inputCls} pr-9`} />
                            <HelpCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          </div>
                        </div>
                        <input value={form.cardName} onChange={set('cardName')} placeholder="Name on card" className={inputCls} />
                      </div>
                    )}

                    {/* EasyPaisa fields */}
                    {form.advanceMethod === 'easypaisa' && id === 'easypaisa' && (
                      <div className="px-4 pb-4 pt-3 bg-gray-50 space-y-3">
                        <div className="bg-white border border-green-200 rounded p-3 text-sm text-gray-700 space-y-1">
                          <p className="font-semibold text-green-800 mb-2">Send advance to EasyPaisa:</p>
                          <p>📱 <strong>Number:</strong> {EASYPAISA_NUMBER}</p>
                          <p>👤 <strong>Account Name:</strong> {EASYPAISA_NAME}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Amount: <strong>Rs {advance.toLocaleString()}.00</strong> — use your order number as reference after placing.
                          </p>
                        </div>
                        <input
                          value={form.mobileNumber}
                          onChange={set('mobileNumber')}
                          placeholder="Your EasyPaisa mobile number"
                          className={inputCls}
                        />
                      </div>
                    )}

                    {/* JazzCash fields */}
                    {form.advanceMethod === 'jazzcash' && id === 'jazzcash' && (
                      <div className="px-4 pb-4 pt-3 bg-gray-50 space-y-3">
                        <div className="bg-white border border-orange-200 rounded p-3 text-sm text-gray-700 space-y-1">
                          <p className="font-semibold text-orange-800 mb-2">Send advance to JazzCash:</p>
                          <p>📱 <strong>Number:</strong> {JAZZCASH_NUMBER}</p>
                          <p>👤 <strong>Account Name:</strong> {JAZZCASH_NAME}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Amount: <strong>Rs {advance.toLocaleString()}.00</strong> — use your order number as reference after placing.
                          </p>
                        </div>
                        <input
                          value={form.mobileNumber}
                          onChange={set('mobileNumber')}
                          placeholder="Your JazzCash mobile number"
                          className={inputCls}
                        />
                      </div>
                    )}

                    {/* Bank Transfer fields */}
                    {form.advanceMethod === 'bank' && id === 'bank' && (
                      <div className="px-4 pb-4 pt-3 bg-gray-50">
                        <div className="bg-white border border-yellow-200 rounded p-3 text-sm text-gray-700 space-y-1">
                          <p className="font-semibold text-yellow-800 mb-2">Bank Transfer Details:</p>
                          <p>🏦 <strong>Bank:</strong> {BANK_NAME}</p>
                          <p>👤 <strong>Account Title:</strong> {BANK_TITLE}</p>
                          <p>🔢 <strong>Account No:</strong> {BANK_ACCOUNT}</p>
                          <p>🌐 <strong>IBAN:</strong> {BANK_IBAN}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Transfer <strong>Rs {advance.toLocaleString()}.00</strong> and use your <strong>Order ID</strong> as the payment reference.
                            Your order will not be processed until the advance clears.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* COD reminder */}
              <div className="mt-3 bg-green-50 border border-green-200 rounded px-4 py-3 text-sm text-green-800 flex items-start gap-2">
                <span className="text-lg leading-none">🚚</span>
                <span>The remaining <strong>Rs {cod.toLocaleString()}.00</strong> will be collected in cash when your order is delivered.</span>
              </div>
            </section>

            {/* Billing address */}
            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-3">Billing address</h2>
              <div className="border border-gray-300 rounded overflow-hidden divide-y divide-gray-200">

                <label className={`flex items-center gap-2 px-4 py-3 cursor-pointer ${form.billingOption === 'same' ? 'bg-blue-50/40' : 'bg-white'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${form.billingOption === 'same' ? 'border-[#2b3a7a]' : 'border-gray-400'}`}>
                    {form.billingOption === 'same' && <div className="w-2 h-2 rounded-full bg-[#2b3a7a]" />}
                  </div>
                  <span className="text-sm text-gray-800">Same as shipping address</span>
                  <input type="radio" name="billing" value="same" checked={form.billingOption === 'same'} onChange={set('billingOption')} className="sr-only" />
                </label>

                <div>
                  <label className={`flex items-center gap-2 px-4 py-3 cursor-pointer ${form.billingOption === 'different' ? 'bg-blue-50/40' : 'bg-white'}`}>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${form.billingOption === 'different' ? 'border-[#2b3a7a]' : 'border-gray-400'}`}>
                      {form.billingOption === 'different' && <div className="w-2 h-2 rounded-full bg-[#2b3a7a]" />}
                    </div>
                    <span className="text-sm text-gray-800">Use a different billing address</span>
                    <input type="radio" name="billing" value="different" checked={form.billingOption === 'different'} onChange={set('billingOption')} className="sr-only" />
                  </label>

                  {form.billingOption === 'different' && (
                    <div className="px-4 pb-4 pt-1 bg-white space-y-3">
                      <div className="relative">
                        <label className={labelCls}>Country/Region</label>
                        <div className="relative">
                          <select className={`${inputCls} appearance-none pr-8`}>
                            <option>Pakistan</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input value={form.billFirstName} onChange={set('billFirstName')} placeholder="First name" className={inputCls} />
                        <input value={form.billLastName}  onChange={set('billLastName')}  placeholder="Last name"  className={inputCls} />
                      </div>
                      <input value={form.billAddress}   onChange={set('billAddress')}   placeholder="Address"                           className={inputCls} />
                      <input value={form.billApartment} onChange={set('billApartment')} placeholder="Apartment, suite, etc. (optional)" className={inputCls} />
                      <div className="grid grid-cols-2 gap-3">
                        <input value={form.billCity}   onChange={set('billCity')}   placeholder="City"                   className={inputCls} />
                        <input value={form.billPostal} onChange={set('billPostal')} placeholder="Postal code (optional)" className={inputCls} />
                      </div>
                      <div className="relative">
                        <input value={form.billPhone} onChange={set('billPhone')} placeholder="Phone (required)" className={`${inputCls} pr-9`} />
                        <HelpCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* API error */}
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">
                {apiError}
              </div>
            )}

            {/* Submit button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || items.length === 0}
              className="w-full py-3.5 bg-[#2b3a7a] hover:bg-[#1e2d63] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold uppercase tracking-widest rounded transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Processing…
                </>
              ) : (
                `Pay Rs ${advance.toLocaleString()} now & confirm order`
              )}
            </button>

            <div className="flex flex-wrap gap-4 text-xs text-[#2b3a7a] pb-4">
              <Link to="/privacy" className="hover:underline">Privacy policy</Link>
            </div>
          </div>

          {/* ── RIGHT COLUMN — Order Summary ── */}
          <div className="w-full lg:w-[360px] shrink-0 lg:sticky lg:top-8">
            <div className="border border-gray-200 rounded bg-white p-5">
              <div className="divide-y divide-gray-100">
                {items.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">Your cart is empty</p>
                ) : (
                  items.map((item, idx) => {
                    const price = item.isSale && item.salePrice ? item.salePrice : item.price;
                    return (
                      <div key={`${item._id}-${item.size}-${idx}`} className="py-3 flex items-center gap-3">
                        <div className="relative shrink-0">
                          <div className="w-14 h-14 rounded border border-gray-200 overflow-hidden bg-gray-100">
                            <img
                              src={item.images?.[0] || '/images/logo.avif'}
                              alt={item.name}
                              className="w-full h-full object-cover object-top"
                              onError={(e) => { e.target.src = '/images/logo.avif'; }}
                            />
                          </div>
                          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-500 text-white text-[10px] font-bold flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{item.size}</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-800 shrink-0">
                          Rs {(price * item.quantity).toLocaleString()}.00
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2.5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal · {items.length} item{items.length !== 1 ? 's' : ''}</span>
                  <span className="font-medium">Rs {subtotal.toLocaleString()}.00</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium">Rs {shipping.toLocaleString()}.00</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-100 pt-2.5">
                  <span>Total</span>
                  <span className="text-[#2b3a7a] text-base">
                    <span className="text-xs font-normal text-gray-400 mr-1">PKR</span>
                    Rs {total.toLocaleString()}.00
                  </span>
                </div>
                {/* Payment split summary */}
                <div className="bg-gray-50 rounded p-3 text-xs space-y-1 border border-gray-100">
                  <div className="flex justify-between text-blue-700 font-semibold">
                    <span>Pay now (advance)</span>
                    <span>Rs {advance.toLocaleString()}.00</span>
                  </div>
                  <div className="flex justify-between text-green-700 font-semibold">
                    <span>Pay on delivery (COD)</span>
                    <span>Rs {cod.toLocaleString()}.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}