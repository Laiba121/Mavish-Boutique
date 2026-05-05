import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: JSON.parse(localStorage.getItem('mavish_cart') || '[]'),
    isOpen: false,
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, size, quantity = 1 } = action.payload;
      const existing = state.items.find(
        i => i._id === product._id && i.size === size
      );
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ ...product, size, quantity });
      }
      localStorage.setItem('mavish_cart', JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      const { id, size } = action.payload;
      state.items = state.items.filter(i => !(i._id === id && i.size === size));
      localStorage.setItem('mavish_cart', JSON.stringify(state.items));
    },
    updateQuantity: (state, action) => {
      const { id, size, quantity } = action.payload;
      const item = state.items.find(i => i._id === id && i.size === size);
      if (item) item.quantity = quantity;
      localStorage.setItem('mavish_cart', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('mavish_cart');
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, toggleCart } =
  cartSlice.actions;

// ✅ THIS IS THE FIX
export default cartSlice.reducer;