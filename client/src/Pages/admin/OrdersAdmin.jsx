import { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import Topbar from '../../components/admin/Topbar';
import api from '../../utils/api';

const STATUS_BADGE = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-teal-100 text-teal-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const PAYMENT_BADGE = {
  pending: 'bg-yellow-100 text-yellow-800',
  advance_pending: 'bg-orange-100 text-orange-800',
  ss_pending: 'bg-purple-100 text-purple-800',
  advance_confirmed: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-600',
};

const PAYMENT_LABEL = {
  pending: 'Pending',
  advance_pending: 'Advance Pending',
  ss_pending: 'Screenshot Pending',
  advance_confirmed: 'Advance Confirmed',
  paid: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
};

const ADVANCE_METHOD_LABEL = {
  card: 'Card',
  easypaisa: 'EasyPaisa',
  jazzcash: 'JazzCash',
  bank: 'Bank Transfer',
};

export default function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/checkout/orders');
      const data = res?.data;
      setOrders(Array.isArray(data?.orders) ? data.orders : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/checkout/orders/${orderId}`, {
        status: newStatus,
      });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handlePaymentStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/checkout/orders/${orderId}`, {
        paymentStatus: newStatus,
      });
      fetchOrders();
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const handleDelete = async (orderId) => {
    const ok = window.confirm('Delete this order? This will permanently delete order.');
    if (!ok) return;
    try {
      await api.delete(`/checkout/orders/${orderId}`);
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order. See console for details.');
    }
  };

  const visible = orders.filter((o) => {
    const q = search.toLowerCase();

    const matchSearch =
      !q ||
      o.orderNumber?.toLowerCase().includes(q) ||
      o.email?.toLowerCase().includes(q) ||
      `${o.shippingAddress?.firstName} ${o.shippingAddress?.lastName}`
        .toLowerCase()
        .includes(q);

    const matchStatus =
      statusFilter === 'all' || o.status === statusFilter;

    const matchPayment =
      paymentFilter === 'all' ||
      o.paymentStatus === paymentFilter;

    return matchSearch && matchStatus && matchPayment;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />

          <div className="p-4 sm:p-6 text-gray-500">
            Loading orders...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
              Orders
            </h1>

            <span className="text-sm text-gray-500">
              {orders.length} total
            </span>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4 mb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, order #..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2b3a7a]"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
              >
                <option value="all">All payments</option>
                <option value="pending">Pending</option>
                <option value="advance_pending">
                  Advance Pending
                </option>
                <option value="ss_pending">Screenshot Pending</option>
                <option value="advance_confirmed">
                  Advance Confirmed
                </option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {visible.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
              >
                {/* Top */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-[#2b3a7a] text-sm sm:text-base break-all">
                      {order.orderNumber}
                    </h2>

                    <p className="text-xs text-gray-400 mt-1">
                      #{order._id.slice(-6)}
                    </p>
                  </div>

                  <div
                    className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${
                      STATUS_BADGE[order.status]
                    }`}
                  >
                    {order.status}
                  </div>
                </div>

                {/* Customer */}
                <div className="mt-4 space-y-1">
                  <p className="font-medium text-sm text-gray-800">
                    {order.shippingAddress?.firstName}{' '}
                    {order.shippingAddress?.lastName}
                  </p>

                  <p className="text-xs text-gray-500 break-all">
                    {order.email}
                  </p>

                  <p className="text-xs text-gray-500">
                    {order.shippingAddress?.phone}
                  </p>
                </div>

                {/* Payment */}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">
                      Total
                    </p>

                    <p className="font-bold text-gray-900">
                      Rs {order.total?.toLocaleString()}
                    </p>
                  </div>

                  <div
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      PAYMENT_BADGE[order.paymentStatus]
                    }`}
                  >
                    {PAYMENT_LABEL[order.paymentStatus]}
                  </div>
                </div>

                {order.payment?.screenshotUrl && (
                  <div className="mt-3">
                    <a href={order.payment.screenshotUrl} target="_blank" rel="noreferrer">
                      <img
                        src={order.payment.screenshotUrl}
                        alt="ss"
                        className="w-36 h-auto rounded-lg border border-gray-200 object-cover"
                      />
                    </a>
                  </div>
                )}

                {/* Date */}
                <div className="mt-3 text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString(
                    'en-PK',
                    {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    }
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">

                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(
                        order._id,
                        e.target.value
                      )
                    }
                    className={`w-full text-xs font-semibold px-2 py-2 rounded-lg border-0 outline-none cursor-pointer ${STATUS_BADGE[order.status]}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <select
                    value={order.paymentStatus}
                    onChange={(e) =>
                      handlePaymentStatusChange(
                        order._id,
                        e.target.value
                      )
                    }
                    className={`w-full text-xs font-semibold px-2 py-2 rounded-lg border-0 outline-none cursor-pointer ${PAYMENT_BADGE[order.paymentStatus]}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="advance_pending">
                      Advance Pending
                    </option>
                    <option value="ss_pending">Screenshot Pending</option>
                    <option value="advance_confirmed">
                      Advance Confirmed
                    </option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>

                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="w-full bg-[#2b3a7a] hover:bg-[#1f2c60] text-white text-sm font-medium rounded-lg py-2 transition"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(order._id)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg py-2 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {visible.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-12 text-center text-sm text-gray-400">
                No orders found.
              </div>
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Order</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">
                      Payment Split
                    </th>
                    <th className="px-4 py-3 text-left">Total</th>
                    <th className="px-4 py-3 text-left">
                      Order Status
                    </th>
                    <th className="px-4 py-3 text-left">
                      Payment Status
                    </th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {visible.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50 transition"
                    >
                      {/* Order */}
                      <td className="px-4 py-4">
                        <p className="font-semibold text-[#2b3a7a]">
                          {order.orderNumber}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          #{order._id.slice(-6)}
                        </p>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-800">
                          {order.shippingAddress?.firstName}{' '}
                          {order.shippingAddress?.lastName}
                        </p>

                        <p className="text-xs text-gray-400">
                          {order.email}
                        </p>

                        <p className="text-xs text-gray-400">
                          {order.shippingAddress?.phone}
                        </p>
                      </td>

                      {/* Payment split */}
                      <td className="px-4 py-4">
                        {order.paymentMethod ===
                        'hybrid_cod' ? (
                          <div className="space-y-1">
                            <div className="text-xs">
                              <span className="font-semibold text-blue-700">
                                Rs{' '}
                                {order.advanceAmount?.toLocaleString()}
                              </span>

                              <span className="text-gray-400">
                                {' '}
                                advance
                              </span>
                            </div>

                            <div className="text-xs">
                              <span className="font-semibold text-green-700">
                                Rs{' '}
                                {order.codAmount?.toLocaleString()}
                              </span>

                              <span className="text-gray-400">
                                {' '}
                                COD
                              </span>
                            </div>

                            {order.advanceMethod && (
                              <span className="inline-block text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                {ADVANCE_METHOD_LABEL[
                                  order.advanceMethod
                                ] || order.advanceMethod}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 capitalize">
                            {order.paymentMethod}
                          </span>
                        )}
                      </td>

                      {/* Total */}
                      <td className="px-4 py-4 font-semibold text-gray-800">
                        Rs {order.total?.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(
                              order._id,
                              e.target.value
                            )
                          }
                          className={`text-xs font-semibold px-2 py-1.5 rounded border-0 outline-none cursor-pointer ${STATUS_BADGE[order.status]}`}
                        >
                          <option value="pending">
                            Pending
                          </option>
                          <option value="confirmed">
                            Confirmed
                          </option>
                          <option value="processing">
                            Processing
                          </option>
                          <option value="shipped">
                            Shipped
                          </option>
                          <option value="delivered">
                            Delivered
                          </option>
                          <option value="cancelled">
                            Cancelled
                          </option>
                        </select>
                      </td>

                      {/* Payment */}
                      <td className="px-4 py-4">
                        <select
                          value={order.paymentStatus}
                          onChange={(e) =>
                            handlePaymentStatusChange(
                              order._id,
                              e.target.value
                            )
                          }
                          className={`text-xs font-semibold px-2 py-1.5 rounded border-0 outline-none cursor-pointer ${PAYMENT_BADGE[order.paymentStatus]}`}
                        >
                          <option value="pending">
                            Pending
                          </option>
                          <option value="advance_pending">
                            Advance Pending
                          </option>
                          <option value="ss_pending">Screenshot Pending</option>
                          <option value="advance_confirmed">
                            Advance Confirmed
                          </option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                          <option value="refunded">
                            Refunded
                          </option>
                        </select>
                        {order.payment?.screenshotUrl && (
                          <div className="mt-2">
                            <a href={order.payment.screenshotUrl} target="_blank" rel="noreferrer">
                              <img
                                src={order.payment.screenshotUrl}
                                alt="payment screenshot"
                                className="w-24 h-auto rounded-md border border-gray-200 object-cover"
                              />
                            </a>
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(
                          order.createdAt
                        ).toLocaleDateString('en-PK', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-4">
                        <button
                          onClick={() =>
                            setSelectedOrder(order)
                          }
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(order._id)}
                          className="ml-3 text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {visible.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-10 text-gray-400 text-sm"
                      >
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[95vh] overflow-y-auto">

            {/* Header */}
            <div className="sticky top-0 bg-white z-10 px-4 sm:px-6 py-4 border-b border-gray-200 flex items-start justify-between gap-4 rounded-t-2xl">
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 break-all">
                  {selectedOrder.orderNumber}
                </h2>

                <p className="text-xs text-gray-400 mt-1">
                  {new Date(
                    selectedOrder.createdAt
                  ).toLocaleString('en-PK')}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="shrink-0 text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-6">

              {/* Customer */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Customer
                </h3>

                <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2 break-words">
                  <p>
                    <span className="text-gray-500">
                      Name:
                    </span>{' '}
                    {selectedOrder.shippingAddress?.firstName}{' '}
                    {selectedOrder.shippingAddress?.lastName}
                  </p>

                  <p className="break-all">
                    <span className="text-gray-500">
                      Email:
                    </span>{' '}
                    {selectedOrder.email}
                  </p>

                  <p>
                    <span className="text-gray-500">
                      Phone:
                    </span>{' '}
                    {selectedOrder.shippingAddress?.phone}
                  </p>

                  <p>
                    <span className="text-gray-500">
                      Address:
                    </span>{' '}
                    {selectedOrder.shippingAddress?.address}
                    {selectedOrder.shippingAddress
                      ?.apartment
                      ? `, ${selectedOrder.shippingAddress.apartment}`
                      : ''}
                    ,{' '}
                    {selectedOrder.shippingAddress?.city}
                  </p>
                </div>
              </section>

              {/* Payment */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Payment
                </h3>

                <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-500">
                      Method
                    </span>

                    <span className="font-medium text-right">
                      {selectedOrder.paymentMethod ===
                      'hybrid_cod'
                        ? '50% Advance + 50% COD'
                        : selectedOrder.paymentMethod}
                    </span>
                  </div>

                  {selectedOrder.paymentMethod ===
                    'hybrid_cod' && (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500">
                          Advance Method
                        </span>

                        <span className="font-medium text-right">
                          {ADVANCE_METHOD_LABEL[
                            selectedOrder.advanceMethod
                          ] ||
                            selectedOrder.advanceMethod}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500">
                          Advance
                        </span>

                        <span className="font-semibold text-blue-700">
                          Rs{' '}
                          {selectedOrder.advanceAmount?.toLocaleString()}
                          .00
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500">
                          COD
                        </span>

                        <span className="font-semibold text-green-700">
                          Rs{' '}
                          {selectedOrder.codAmount?.toLocaleString()}
                          .00
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-500">
                      Payment Status
                    </span>

                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${PAYMENT_BADGE[selectedOrder.paymentStatus]}`}
                    >
                      {PAYMENT_LABEL[
                        selectedOrder.paymentStatus
                      ] || selectedOrder.paymentStatus}
                    </span>
                  </div>
                  {selectedOrder.payment?.screenshotUrl && (
                    <div className="mt-3">
                      <span className="text-gray-500 text-xs">Payment Screenshot</span>

                      <div className="mt-2">
                        <a href={selectedOrder.payment.screenshotUrl} target="_blank" rel="noreferrer">
                          <img
                            src={selectedOrder.payment.screenshotUrl}
                            alt="Payment screenshot"
                            className="w-48 h-auto rounded-lg border border-gray-200 object-cover"
                          />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Items */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Items
                </h3>

                <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
                  {selectedOrder.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 sm:p-4"
                    >
                      <img
                        src={item.image || '/images/logo.avif'}
                        alt={item.name}
                        className="w-14 h-14 rounded-lg object-cover border border-gray-200 bg-gray-100 shrink-0"
                        onError={(e) => {
                          e.target.src =
                            '/images/logo.avif';
                        }}
                      />

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 break-words">
                          {item.name}
                        </p>

                        {item.size && (
                          <p className="text-xs text-gray-400 mt-1">
                            Size: {item.size}
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold">
                          Rs{' '}
                          {(
                            item.price * item.quantity
                          ).toLocaleString()}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Totals */}
              <section className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3 text-gray-500">
                  <span>Subtotal</span>

                  <span>
                    Rs{' '}
                    {selectedOrder.subtotal?.toLocaleString()}
                    .00
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-gray-500">
                  <span>
                    Shipping (
                    {selectedOrder.shippingMethod})
                  </span>

                  <span>
                    Rs{' '}
                    {selectedOrder.shippingCost?.toLocaleString()}
                    .00
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 font-bold text-gray-900 text-base pt-2 border-t border-gray-200">
                  <span>Total</span>

                  <span className="text-[#2b3a7a]">
                    Rs{' '}
                    {selectedOrder.total?.toLocaleString()}
                    .00
                  </span>
                </div>
              </section>

              {/* Note */}
              {selectedOrder.note && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Note
                  </h3>

                  <p className="text-sm text-gray-700 bg-yellow-50 border border-yellow-200 rounded-xl p-4 break-words">
                    {selectedOrder.note}
                  </p>
                </section>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white px-4 sm:px-6 py-4 border-t border-gray-200 flex justify-end rounded-b-2xl">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full sm:w-auto px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}