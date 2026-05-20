import { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { CheckCircle, Package, Mail } from 'lucide-react';

export default function OrderConfirmationPage() {
  const { id }                       = useParams();
  const { state }                    = useLocation();
  const [order, setOrder]            = useState(null);
  const [loading, setLoading]        = useState(true);
  const [error, setError]            = useState('');

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res  = await fetch(`/api/checkout/orders/${id}`, { credentials: 'include' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setOrder(data);
      } catch (err) {
        setError(err.message || 'Could not load order details.');
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#2b3a7a] border-t-transparent rounded-full" />
      </div>
    );
  }

  const orderNumber = order?.orderNumber || state?.orderNumber || '—';

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b border-gray-200 w-full">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-center">
          <Link to="/">
            <img src="/images/logo1.png" alt="Logo" className="h-10 object-contain" onError={e => { e.target.style.display = 'none'; }} />
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Success banner */}
        <div className="flex flex-col items-center text-center mb-10">
          <CheckCircle size={56} strokeWidth={1.5} className="text-green-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Order Confirmed!</h1>
          <p className="text-gray-500 text-sm">
            A confirmation email has been sent to{' '}
            <span className="font-medium text-gray-700">{order?.email}</span>
          </p>
        </div>

        {/* Order number card */}
        <div className="bg-white border border-gray-200 rounded p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Order number</p>
              <p className="text-lg font-bold text-[#2b3a7a]">{orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Status</p>
              <span className="inline-block bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border border-green-200">
                {order?.status || 'Confirmed'}
              </span>
            </div>
          </div>

          {/* Bank deposit notice */}
          {order?.advanceMethod === 'bank' && (
            <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-4 text-sm text-amber-800">
              <strong className="block mb-1">Bank Transfer Required</strong>
              Please transfer <strong>Rs {order.advanceAmount?.toLocaleString()}.00</strong> to our bank account
              using <strong>{orderNumber}</strong> as the payment reference. Your order will ship once payment clears.
            </div>
          )}

          {/* Items */}
          {error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : order?.items?.length > 0 ? (
            <div className="divide-y divide-gray-100 mt-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded border border-gray-200 overflow-hidden bg-gray-100 shrink-0">
                    <img src={item.image || '/images/logo.avif'} alt={item.name} className="w-full h-full object-cover object-top" onError={e => { e.target.src = '/images/logo.avif'; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    {item.size && <p className="text-xs text-gray-400">{item.size}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-gray-800">Rs {(item.price * item.quantity).toLocaleString()}.00</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Totals */}
          {order && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>Rs {order.subtotal?.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping ({order.shippingMethod})</span>
                <span>Rs {order.shippingCost?.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-[#2b3a7a]">PKR Rs {order.total?.toLocaleString()}.00</span>
              </div>
            </div>
          )}
        </div>

        {/* Shipping address */}
        {order?.shippingAddress && (
          <div className="bg-white border border-gray-200 rounded p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Package size={16} className="text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Shipping to</h2>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br/>
              {order.shippingAddress.address}{order.shippingAddress.apartment ? `, ${order.shippingAddress.apartment}` : ''}<br/>
              {order.shippingAddress.city}{order.shippingAddress.postalCode ? ` ${order.shippingAddress.postalCode}` : ''}, {order.shippingAddress.country}<br/>
              {order.shippingAddress.phone}
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/"
            className="flex-1 text-center py-3 bg-[#2b3a7a] hover:bg-[#1e2d63] text-white text-sm font-bold uppercase tracking-widest rounded transition"
          >
            Continue Shopping
          </Link>
          <Link
            to="/orders"
            className="flex-1 text-center py-3 border border-gray-300 text-sm font-semibold text-gray-700 uppercase tracking-widest rounded hover:bg-gray-50 transition"
          >
            View All Orders
          </Link>
        </div>
      </main>
    </div>
  );
}
