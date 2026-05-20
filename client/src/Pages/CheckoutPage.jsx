import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingBag, ChevronDown, Lock, HelpCircle, CreditCard } from 'lucide-react';
import { clearCart } from '../store/cartSlice';

const BANK_NAME    = import.meta.env.VITE_BANK_NAME              || 'HBL';
const BANK_TITLE   = import.meta.env.VITE_BANK_ACCOUNT_TITLE     || 'Mehrma Boutique';
const BANK_ACCOUNT = import.meta.env.VITE_BANK_ACCOUNT_NUMBER    || '0123-4567890-001';
const BANK_IBAN    = import.meta.env.VITE_BANK_IBAN              || 'PK36HABB0000000000000000';
const API_URL      = import.meta.env.VITE_API_URL                || 'http://localhost:5000/api';

function detectBrand(n) {
  const s = n.replace(/\s/g, '');
  if (/^4/.test(s))      return 'visa';
  if (/^5[1-5]/.test(s)) return 'mastercard';
  return null;
}

export default function CheckoutPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();

  const buyNowMode  = location.state?.buyNowMode;
  const buyNowItems = location.state?.buyNowItems;
  const cartItems   = useSelector((s) => s.cart.items);
  const items       = buyNowMode ? buyNowItems : cartItems;
  const user        = useSelector((s) => s.auth.user);

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

  const [cardErrors, setCardErrors] = useState({});
  const [loading, setLoading]       = useState(false);
  const [apiError, setApiError]     = useState('');

  // ── Prefill user data ──
  useEffect(() => {
    if (user) {
      const [firstName = '', lastName = ''] = (user.name || '').split(' ');
      setForm((prev) => ({
        ...prev,
        email:      user.email      || '',
        firstName:  user.firstName  || firstName,
        lastName:   user.lastName   || lastName,
        phone:      user.phone      || '',
        address:    user.address    || '',
        city:       user.city       || '',
        postalCode: user.postalCode || '',
      }));
    }
  }, [user]);

  const subtotal = items.reduce((sum, i) => {
    const price = i.isSale && i.salePrice ? i.salePrice : i.price;
    return sum + price * i.quantity;
  }, 0);
  const shipping = subtotal > 0 ? 380 : 0;
  const total    = subtotal + shipping;
  const advance  = Math.ceil(total / 2);
  const cod      = total - advance;

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleCardNumber = (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    setForm(f => ({ ...f, cardNumber: v }));
    setCardErrors(p => ({ ...p, cardNumber: '' }));
  };
  const handleExpiry = (e) => {
    const d = e.target.value.replace(/\D/g, '').slice(0, 4);
    const v = d.length >= 3 ? d.slice(0, 2) + ' / ' + d.slice(2) : d;
    setForm(f => ({ ...f, expiry: v }));
    setCardErrors(p => ({ ...p, expiry: '' }));
  };
  const handleCvv = (e) => {
    setForm(f => ({ ...f, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }));
    setCardErrors(p => ({ ...p, cvv: '' }));
  };
  const cardBrand = detectBrand(form.cardNumber);

  function validateCard() {
    const errors = {};
    if (!form.cardNumber.replace(/\s/g, '') || form.cardNumber.replace(/\s/g, '').length < 15)
      errors.cardNumber = 'Enter a valid card number';
    if (!form.expiry || form.expiry.replace(/[\s/]/g, '').length < 4)
      errors.expiry = 'Enter expiry (MM / YY)';
    if (!form.cvv || form.cvv.length < 3)
      errors.cvv = 'Enter CVV';
    if (!form.cardName.trim())
      errors.cardName = 'Enter name on card';
    return errors;
  }

  const inputCls = "w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#2b3a7a] focus:ring-1 focus:ring-[#2b3a7a] transition bg-white";
  const labelCls = "block text-xs text-gray-500 mb-1 font-medium";
  const errCls   = "text-xs text-red-500 mt-1";

  function submitPayfastForm(actionUrl, fields) {
    const paymentForm = document.createElement('form');
    paymentForm.method = 'POST';
    paymentForm.action = actionUrl;
    paymentForm.style.display = 'none';

    Object.entries(fields || {}).forEach(([name, value]) => {
      if (value === undefined || value === null || value === '') return;
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = String(value);
      paymentForm.appendChild(input);
    });

    document.body.appendChild(paymentForm);
    paymentForm.submit();
  }

  // ── SUBMIT ────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    setApiError('');

    if (!form.email || !form.firstName || !form.lastName || !form.address || !form.city || !form.phone) {
      setApiError('Please fill in all required delivery fields.');
      return;
    }
    // Note: for card payments, PayFast collects card details on their hosted
    // checkout page — we do NOT collect card data here (PCI compliant).
    // The card fields shown below are purely for UX preview; they are NOT sent.
    if (['easypaisa', 'jazzcash'].includes(form.advanceMethod) && !form.mobileNumber) {
      setApiError(`Please enter your ${form.advanceMethod === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'} mobile number.`);
      return;
    }
    if (form.billingOption === 'different') {
      if (!form.billFirstName || !form.billLastName || !form.billAddress || !form.billCity || !form.billPhone) {
        setApiError('Please fill complete billing address.'); return;
      }
    }

    setLoading(true);

    // ⚠️  Never send card fields to our server — PayFast handles card data
    const payload = {
      email: form.email, firstName: form.firstName, lastName: form.lastName,
      address: form.address, apartment: form.apartment, city: form.city,
      postalCode: form.postalCode, phone: form.phone, saveInfo: form.saveInfo,
      shippingMethod: 'Standard', shippingCost: 380,
      paymentMethod: 'hybrid_cod', advanceMethod: form.advanceMethod,
      advanceAmount: advance, codAmount: cod,
      billingOption: form.billingOption,
      billFirstName: form.billFirstName, billLastName: form.billLastName,
      billAddress: form.billAddress, billApartment: form.billApartment,
      billCity: form.billCity, billPostal: form.billPostal, billPhone: form.billPhone,
      ...((['easypaisa', 'jazzcash'].includes(form.advanceMethod)) && { mobileNumber: form.mobileNumber }),
      items: items.map(i => ({
        productId: i._id, name: i.name, image: i.images?.[0] || '',
        size: i.size, price: i.isSale && i.salePrice ? i.salePrice : i.price,
        quantity: i.quantity,
      })),
    };

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (user?.token) headers['Authorization'] = `Bearer ${user.token}`;
      if (user?._id)   headers['x-user-id']     = user._id;

      const res  = await fetch(`${API_URL}/checkout`, { method: 'POST', headers, credentials: 'include', body: JSON.stringify(payload) });
      const data = await res.json();

      if (!res.ok) {
        setApiError(data.errors ? data.errors.join(' • ') : data.message || 'Something went wrong.');
        setLoading(false);
        return;
      }

      localStorage.setItem('guestEmail', form.email);

      // ── BANK TRANSFER — go straight to confirmation ──
      if (data.paymentType === 'bank_transfer' || data.paymentType === 'manual') {
        dispatch(clearCart());
        navigate(`/order-confirmation/${data.orderId}`, {
          state: { orderNumber: data.orderNumber, paymentType: data.paymentType }
        });
        return;
      }

      // ── PAYFAST FORM POST — submit browser to PayFast hosted checkout ──
      if (data.paymentType === 'payfast_form' && data.payfast?.actionUrl) {
        dispatch(clearCart());
        submitPayfastForm(data.payfast.actionUrl, data.payfast.fields);
        return;
      }

      // Fallback
      dispatch(clearCart());
      navigate(`/order-confirmation/${data.orderId}`, { state: { orderNumber: data.orderNumber } });

    } catch (err) {
      console.error('[checkout]', err);
      setApiError('Network error. Please check your connection.');
      setLoading(false);
    }
  }

  const advanceMethods = [
    { id: 'card',      label: 'Debit / Credit Card' },
    { id: 'easypaisa', label: 'EasyPaisa' },
    { id: 'jazzcash',  label: 'JazzCash' },
    { id: 'bank',      label: 'Bank Transfer' },
  ];

  // ── MAIN CHECKOUT FORM ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b border-gray-200 w-full">
        <div className="max-w-5xl mx-auto px-6 py-3 relative flex items-center justify-center">
          <Link to="/">
            <img src="/images/logo1.png" alt="Logo" className="h-15 object-contain"
              onError={e => e.target.style.display = 'none'} />
          </Link>
          <button onClick={() => navigate('/cart')}
            className="absolute right-6 text-gray-500 hover:text-gray-700 transition">
            <ShoppingBag size={22} strokeWidth={1.6} />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* LEFT COLUMN */}
          <div className="flex-1 w-full space-y-6">

            <nav className="text-xs text-gray-400 flex items-center gap-1.5">
              <Link to="/cart" className="hover:text-[#2b3a7a] transition">Cart</Link>
              <span>›</span><span className="text-gray-700 font-semibold">Information</span>
              <span>›</span><span>Shipping</span><span>›</span><span>Payment</span>
            </nav>

            {/* Contact */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-900">Contact</h2>
                {!user && <Link to="/login" className="text-sm text-[#2b3a7a] hover:underline">Sign in</Link>}
              </div>
              <input type="text" value={form.email} onChange={set('email')} placeholder="Email" className={inputCls} />
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
              <input value={form.address}   onChange={set('address')}   placeholder="Address"                           className={`${inputCls} mb-3`} />
              <input value={form.apartment} onChange={set('apartment')} placeholder="Apartment, suite, etc. (optional)" className={`${inputCls} mb-3`} />
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input value={form.city}       onChange={set('city')}       placeholder="City"                   className={inputCls} />
                <input value={form.postalCode} onChange={set('postalCode')} placeholder="Postal code (optional)" className={inputCls} />
              </div>
              <div className="relative mb-3">
                <input value={form.phone} onChange={set('phone')} placeholder="Phone" className={`${inputCls} pr-9`} />
                <HelpCircle size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                <input type="checkbox" checked={form.saveInfo} onChange={set('saveInfo')}
                  className="w-4 h-4 rounded border-gray-300 text-[#2b3a7a] focus:ring-[#2b3a7a]" />
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

            {/* Payment */}
            <section>
              <div className="mb-3">
                <h2 className="text-base font-semibold text-gray-900">Payment</h2>
                <p className="text-xs text-gray-400 mt-0.5">All transactions are secure and encrypted.</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4 text-sm text-blue-800">
                <strong className="block mb-2">50% Advance + 50% Cash on Delivery</strong>
                <div className="flex justify-between">
                  <span>Pay now (advance):</span><strong>Rs {advance.toLocaleString()}.00</strong>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Pay on delivery (COD):</span><strong>Rs {cod.toLocaleString()}.00</strong>
                </div>
              </div>

              <p className="text-sm font-medium text-gray-700 mb-2">Choose how to pay the advance:</p>
              <div className="border border-gray-300 rounded overflow-hidden divide-y divide-gray-200">
                {advanceMethods.map(({ id, label }) => (
                  <div key={id}>
                    <label className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${form.advanceMethod === id ? 'bg-blue-50/40' : 'bg-white hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${form.advanceMethod === id ? 'border-[#2b3a7a]' : 'border-gray-400'}`}>
                          {form.advanceMethod === id && <div className="w-2 h-2 rounded-full bg-[#2b3a7a]" />}
                        </div>
                        <span className="text-sm text-gray-800">{label}</span>
                      </div>
                      {id === 'card' && (
                        <div className="flex items-center gap-1.5">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-5 object-contain opacity-70" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5 object-contain opacity-70" />
                        </div>
                      )}
                      <input type="radio" name="advanceMethod" value={id}
                        checked={form.advanceMethod === id} onChange={set('advanceMethod')} className="sr-only" />
                    </label>

                    {/* ── CARD INFO (no card fields — PayFast collects securely on their page) ── */}
                    {form.advanceMethod === 'card' && id === 'card' && (
                      <div className="px-4 pb-4 pt-3 bg-gray-50">
                        <div className="bg-white border border-blue-100 rounded p-3 flex items-start gap-3">
                          <Lock size={16} className="text-green-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-gray-800 mb-0.5">Secure Card Payment via PayFast</p>
                            <p className="text-xs text-gray-500 leading-relaxed">
                              After clicking "Pay now", you'll be taken to PayFast's secure hosted checkout to enter your card details.
                              Your card information is never shared with us.
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-4 object-contain" />
                              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4 object-contain" />
                              <span className="text-xs text-gray-400">· PCI DSS Certified</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── EASYPAISA ── */}
                    {form.advanceMethod === 'easypaisa' && id === 'easypaisa' && (
                      <div className="px-4 pb-4 pt-3 bg-gray-50 space-y-3">
                        <div className="bg-white border border-green-200 rounded p-3 text-sm text-gray-700">
                          <p className="font-semibold text-green-800 mb-1">Pay via EasyPaisa</p>
                          <p className="text-xs text-gray-500">
                            After clicking "Pay now", you'll be redirected to PayFast's secure page to complete your EasyPaisa payment.
                          </p>
                        </div>
                        <div>
                          <label className={labelCls}>EasyPaisa mobile number <span className="text-red-400">*</span></label>
                          <input value={form.mobileNumber} onChange={set('mobileNumber')}
                            placeholder="03XX-XXXXXXX" className={inputCls} />
                        </div>
                      </div>
                    )}

                    {/* ── JAZZCASH ── */}
                    {form.advanceMethod === 'jazzcash' && id === 'jazzcash' && (
                      <div className="px-4 pb-4 pt-3 bg-gray-50 space-y-3">
                        <div className="bg-white border border-orange-200 rounded p-3 text-sm text-gray-700">
                          <p className="font-semibold text-orange-800 mb-1">Pay via JazzCash</p>
                          <p className="text-xs text-gray-500">
                            After clicking "Pay now", you'll be redirected to PayFast's secure page to complete your JazzCash payment.
                          </p>
                        </div>
                        <div>
                          <label className={labelCls}>JazzCash mobile number <span className="text-red-400">*</span></label>
                          <input value={form.mobileNumber} onChange={set('mobileNumber')}
                            placeholder="03XX-XXXXXXX" className={inputCls} />
                        </div>
                      </div>
                    )}

                    {/* ── BANK TRANSFER ── */}
                    {form.advanceMethod === 'bank' && id === 'bank' && (
                      <div className="px-4 pb-4 pt-3 bg-gray-50">
                        <div className="bg-white border border-yellow-200 rounded p-3 text-sm text-gray-700 space-y-1">
                          <p className="font-semibold text-yellow-800 mb-2">Bank Transfer Details:</p>
                          <p>🏦 <strong>Bank:</strong> {BANK_NAME}</p>
                          <p>👤 <strong>Account Title:</strong> {BANK_TITLE}</p>
                          <p>🔢 <strong>Account No:</strong> {BANK_ACCOUNT}</p>
                          <p>🌐 <strong>IBAN:</strong> {BANK_IBAN}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Transfer <strong>Rs {advance.toLocaleString()}.00</strong> and use your <strong>Order ID</strong> as reference.
                            We'll send you a confirmation email once we verify the deposit.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-3 bg-green-50 border border-green-200 rounded px-4 py-3 text-sm text-green-800 flex items-start gap-2">
                <span className="text-lg leading-none">🚚</span>
                <span>The remaining <strong>Rs {cod.toLocaleString()}.00</strong> will be collected in cash on delivery.</span>
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
                  <input type="radio" name="billing" value="same"
                    checked={form.billingOption === 'same'} onChange={set('billingOption')} className="sr-only" />
                </label>
                <div>
                  <label className={`flex items-center gap-2 px-4 py-3 cursor-pointer ${form.billingOption === 'different' ? 'bg-blue-50/40' : 'bg-white'}`}>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${form.billingOption === 'different' ? 'border-[#2b3a7a]' : 'border-gray-400'}`}>
                      {form.billingOption === 'different' && <div className="w-2 h-2 rounded-full bg-[#2b3a7a]" />}
                    </div>
                    <span className="text-sm text-gray-800">Use a different billing address</span>
                    <input type="radio" name="billing" value="different"
                      checked={form.billingOption === 'different'} onChange={set('billingOption')} className="sr-only" />
                  </label>
                  {form.billingOption === 'different' && (
                    <div className="px-4 pb-4 pt-1 bg-white space-y-3">
                      <div className="relative">
                        <label className={labelCls}>Country/Region</label>
                        <div className="relative">
                          <select className={`${inputCls} appearance-none pr-8`}><option>Pakistan</option></select>
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
                        <input value={form.billPhone} onChange={set('billPhone')} placeholder="Phone (required)"
                          className={`${inputCls} pr-9`} />
                        <HelpCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">
                {apiError}
              </div>
            )}

            <button type="button" onClick={handleSubmit} disabled={loading || items.length === 0}
              className="w-full py-3.5 bg-[#2b3a7a] hover:bg-[#1e2d63] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold uppercase tracking-widest rounded transition flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Processing…
                </>
              ) : (
                form.advanceMethod === 'bank'
                  ? `Place Order — Rs ${advance.toLocaleString()} via Bank Transfer`
                  : `Pay Rs ${advance.toLocaleString()} now & confirm order`
              )}
            </button>

            <div className="flex flex-wrap gap-4 text-xs text-[#2b3a7a] pb-4">
              <Link to="/privacy-policy" className="hover:underline">Privacy policy</Link>
            </div>
          </div>

          {/* RIGHT COLUMN — Order Summary */}
          <div className="w-full lg:w-[360px] shrink-0 lg:sticky lg:top-8">
            <div className="border border-gray-200 rounded bg-white p-5">
              <div className="divide-y divide-gray-100">
                {items.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">Your cart is empty</p>
                ) : items.map((item, idx) => {
                  const price = item.isSale && item.salePrice ? item.salePrice : item.price;
                  return (
                    <div key={`${item._id}-${item.size}-${idx}`} className="py-3 flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="w-14 h-14 rounded border border-gray-200 overflow-hidden bg-gray-100">
                          <img src={item.images?.[0] || '/images/logo.avif'} alt={item.name}
                            className="w-full h-full object-cover object-top"
                            onError={e => e.target.src = '/images/logo.avif'} />
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
                })}
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
                <div className="bg-gray-50 rounded p-3 text-xs space-y-1 border border-gray-100">
                  <div className="flex justify-between text-blue-700 font-semibold">
                    <span>Pay now (advance)</span><span>Rs {advance.toLocaleString()}.00</span>
                  </div>
                  <div className="flex justify-between text-green-700 font-semibold">
                    <span>Pay on delivery (COD)</span><span>Rs {cod.toLocaleString()}.00</span>
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
