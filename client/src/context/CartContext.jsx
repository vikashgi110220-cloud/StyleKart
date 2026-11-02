
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

const initialState = {
  items: [],
};

function cartReducer(state, action) {
  switch (action.type) {
    case "SET_CART":
      return {
        items: Array.isArray(action.payload) ? action.payload : [],
      };

    case "ADD_TO_CART": {
      const { product, quantity = 1 } = action.payload;

      const existingItem = state.items.find(
        (item) => String(item.id) === String(product.id)
      );

      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) => {
            if (String(item.id) !== String(product.id)) return item;

            const stock = Number(item.stock) || 0;

            return {
              ...item,
              quantity: Math.min(item.quantity + quantity, stock),
            };
          }),
        };
      }

      const stock = Number(product.stock) || 0;
      if (stock <= 0) return state;

      return {
        ...state,
        items: [
          ...state.items,
          {
            ...product,
            quantity: Math.min(quantity, stock),
          },
        ],
      };
    }

    case "REMOVE_FROM_CART":
      return {
        ...state,
        items: state.items.filter(
          (item) => String(item.id) !== String(action.payload)
        ),
      };

    case "INCREASE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) => {
          if (String(item.id) !== String(action.payload)) return item;

          const stock = Number(item.stock) || 0;

          return {
            ...item,
            quantity: Math.min(item.quantity + 1, stock),
          };
        }),
      };

    case "DECREASE_QUANTITY":
      return {
        ...state,
        items: state.items
          .map((item) =>
            String(item.id) === String(action.payload)
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
          .filter((item) => item.quantity > 0),
      };

    case "CLEAR_CART":
      return {
        items: [],
      };

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const { user } = useAuth();

  const userId = user?.id ? String(user.id) : "guest";
  const storageKey = `stylekart-cart-${userId}`;

  const [state, dispatch] = useReducer(
    cartReducer,
    initialState,
    () => {
      try {
        const savedCart = localStorage.getItem(storageKey);
        const parsedCart = savedCart ? JSON.parse(savedCart) : [];

        return {
          items: Array.isArray(parsedCart) ? parsedCart : [],
        };
      } catch {
        return { items: [] };
      }
    }
  );

  // Load the correct customer's cart whenever account changes.
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(storageKey);
      const parsedCart = savedCart ? JSON.parse(savedCart) : [];

      dispatch({
        type: "SET_CART",
        payload: Array.isArray(parsedCart) ? parsedCart : [],
      });
    } catch {
      dispatch({ type: "SET_CART", payload: [] });
    }
  }, [storageKey]);

  // Save cart for the current customer.
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state.items));
  }, [state.items, storageKey]);

  const addToCart = (product, quantity = 1) => {
    const safeQuantity = Math.max(
      1,
      Math.floor(Number(quantity) || 1)
    );

    dispatch({
      type: "ADD_TO_CART",
      payload: { product, quantity: safeQuantity },
    });
  };

  const removeFromCart = (id) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: id });
  };

  const increaseQuantity = (id) => {
    dispatch({ type: "INCREASE_QUANTITY", payload: id });
  };

  const decreaseQuantity = (id) => {
    dispatch({ type: "DECREASE_QUANTITY", payload: id });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const cartCount = state.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = state.items.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
