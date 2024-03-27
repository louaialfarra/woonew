import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  quantityMap: {},
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const existingItem = state.items.find((item) => item.id === product.id);

      if (!existingItem) {
        state.items.push(product);
        state.quantityMap[product.id] = 1;
      }
    },

    incrementQuantity: (state, action) => {
      const productId = action.payload;
      state.quantityMap[productId] += 1;
    },
    decrementQuantity: (state, action) => {
      const productId = action.payload;
      if (state.quantityMap[productId] > 1) {
        state.quantityMap[productId] -= 1;
      } else {
        state.items = state.items.filter((item) => item.id !== productId);
        delete state.quantityMap[productId];
      }
    },
    removeCartItem: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter((item) => item.id !== productId);
      delete state.quantityMap[productId];
    },
  },
});
// this are action creator
export const {
  addToCart,
  incrementQuantity,
  decrementQuantity,
  removeCartItem,
} = cartSlice.actions;

export default cartSlice.reducer;
