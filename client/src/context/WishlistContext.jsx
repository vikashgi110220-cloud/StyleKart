
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
} from "react";

import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

const initialState = {
  items: [],
};

function wishlistReducer(state, action) {
  switch (action.type) {
    case "SET_WISHLIST":
      return {
        items: Array.isArray(action.payload) ? action.payload : [],
      };

    case "ADD_TO_WISHLIST": {
      const product = action.payload;

      const alreadyExists = state.items.some(
        (item) => String(item.id) === String(product.id)
      );

      if (alreadyExists) return state;

      return {
        items: [...state.items, product],
      };
    }

    case "REMOVE_FROM_WISHLIST":
      return {
        items: state.items.filter(
          (item) => String(item.id) !== String(action.payload)
        ),
      };

    case "CLEAR_WISHLIST":
      return {
        items: [],
      };

    default:
      return state;
  }
}

export function WishlistProvider({ children }) {
  const { user } = useAuth();

  const userId = user?.id ? String(user.id) : "guest";
  const storageKey = `stylekart-wishlist-${userId}`;

  const [state, dispatch] = useReducer(
    wishlistReducer,
    initialState,
    () => {
      try {
        const saved = localStorage.getItem(storageKey);
        const parsed = saved ? JSON.parse(saved) : [];

        return {
          items: Array.isArray(parsed) ? parsed : [],
        };
      } catch {
        return { items: [] };
      }
    }
  );

  // Load wishlist when account changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      const parsed = saved ? JSON.parse(saved) : [];

      dispatch({
        type: "SET_WISHLIST",
        payload: Array.isArray(parsed) ? parsed : [],
      });
    } catch {
      dispatch({
        type: "SET_WISHLIST",
        payload: [],
      });
    }
  }, [storageKey]);

  // Save wishlist for current account
  useEffect(() => {
    localStorage.setItem(
      storageKey,
      JSON.stringify(state.items)
    );
  }, [state.items, storageKey]);

  const addToWishlist = (product) => {
    dispatch({
      type: "ADD_TO_WISHLIST",
      payload: product,
    });
  };

  const removeFromWishlist = (id) => {
    dispatch({
      type: "REMOVE_FROM_WISHLIST",
      payload: id,
    });
  };

  const isInWishlist = (id) => {
    return state.items.some(
      (item) => String(item.id) === String(id)
    );
  };

  const clearWishlist = () => {
    dispatch({ type: "CLEAR_WISHLIST" });
  };

  return (
    <WishlistContext.Provider
      value={{
        items: state.items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        wishlistCount: state.items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
