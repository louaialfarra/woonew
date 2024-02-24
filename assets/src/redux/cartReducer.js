/*const initialState = {
  cart: {
    items: [],
    quantityMap: {},
  },
};

const cartReducer = (state = initialState.cart, action) => {
  switch (action.type) {
    case ADD_TO_CART:
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    case INCREMENT_QUANTITY:
      return {
        ...state,
        quantityMap: {
          ...state.quantityMap,
          [action.payload]: (state.quantityMap[action.payload] || 0) + 1,
        },
      };
    case DECREMENT_QUANTITY:
      return {
        ...state,
        quantityMap: {
          ...state.quantityMap,
          [action.payload]: Math.max(
            (state.quantityMap[action.payload] || 0) - 1,
            0
          ),
        },
      };
    default:
      return state;
  }
};
*/
