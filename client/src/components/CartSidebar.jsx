import { useSelector, useDispatch } from 'react-redux';
import { X, Trash2, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toggleCart, removeFromCart, updateQuantity } from '../store/cartSlice';

export default function CartSidebar() {
    const navigate = useNavigate();
  const dispatch = useDispatch();
  const isOpen = useSelector((s) => s.cart.isOpen);
  const items = useSelector((s) => s.cart.items);

  const subtotal = items.reduce((sum, i) => {
    const price = i.isSale && i.salePrice ? i.salePrice : i.price;
    return sum + price * i.quantity;
  }, 0);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/50"
        onClick={() => dispatch(toggleCart())}
      />

      {/* Sidebar panel */}
      <div className="fixed top-0 right-0 z-[110] h-full w-full max-w-[420px] bg-white shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Shopping Cart</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => dispatch(toggleCart())}
            className="text-gray-400 hover:text-gray-800 transition"
          >
            <X size={22} strokeWidth={1.8} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {items.length === 0 ? (
            <p className="text-sm text-gray-400 text-center mt-10">Your cart is empty.</p>
          ) : (
            items.map((item, idx) => {
              const price = item.isSale && item.salePrice ? item.salePrice : item.price;
              return (
                <div key={`${item._id}-${item.size}-${idx}`} className="flex gap-4">
                  {/* Image */}
                  <div className="w-[90px] h-[90px] shrink-0 bg-gray-100 rounded overflow-hidden border border-gray-200">
                    <img
                      src={item.images?.[0] || '/images/logo.avif'}
                      alt={item.name}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => { e.target.src = '/images/logo.avif'; }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 leading-snug">{item.name}</p>

                    {/* Size row with edit icon */}
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-sm text-gray-500">{item.size}</span>
                      <Pencil size={11} className="text-gray-400" />
                    </div>

                    <p className="mt-1 text-sm font-medium text-gray-800">
                      Rs.{price?.toLocaleString()}.00
                    </p>

                    {/* Quantity stepper */}
                    <div className="mt-2 inline-flex items-center border border-gray-300 rounded">
                      <button
                        type="button"
                        onClick={() =>
                          item.quantity > 1
                            ? dispatch(updateQuantity({ id: item._id, size: item.size, quantity: item.quantity - 1 }))
                            : dispatch(removeFromCart({ id: item._id, size: item.size }))
                        }
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-base border-r border-gray-300 transition"
                      >
                        −
                      </button>
                      <span className="w-9 h-8 flex items-center justify-center text-sm font-semibold text-gray-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(updateQuantity({ id: item._id, size: item.size, quantity: item.quantity + 1 }))
                        }
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-base border-l border-gray-300 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => dispatch(removeFromCart({ id: item._id, size: item.size }))}
                    className="self-start text-gray-300 hover:text-red-400 transition mt-1"
                  >
                    <X size={18} strokeWidth={1.8} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-5 space-y-3">
            <div className="flex justify-between text-sm text-gray-700">
              <span>Subtotal:</span>
              <span className="font-semibold">Rs.{subtotal.toLocaleString()}.00</span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-gray-900">
              <span>Total:</span>
              <span className="text-[#2b3a7a] text-base">Rs.{subtotal.toLocaleString()}.00</span>
            </div>
            <p className="text-xs text-gray-400">Tax included and shipping calculated at checkout</p>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-[#2b3a7a] text-white text-sm font-bold uppercase tracking-widest hover:bg-[#1e2d63] transition rounded-sm"
            >
              CHECKOUT
            </button>
            <button
              type="button"
              onClick={() => {
  dispatch(toggleCart());
  navigate('/cart');
}}
              className="w-full py-3.5 border border-gray-300 text-sm font-semibold text-gray-700 uppercase tracking-widest hover:bg-gray-50 transition rounded-sm"
            >
              VIEW CART
            </button>
          </div>
        )}
      </div>
    </>
  );
}