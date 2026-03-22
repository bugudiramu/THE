"use client";

import { useUser } from "@clerk/nextjs";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  priceSnapshot: number;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    sku: string;
    price: number;
    images: { url: string; alt?: string }[];
  };
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  isLoading: boolean;
  isOpen: boolean;
}

interface CartContextType extends CartState {
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartAction =
  | { type: "SET_LOADING"; payload: boolean }
  | {
      type: "SET_CART";
      payload: { items: CartItem[]; totalItems: number; totalAmount: number };
    }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_CART":
      return {
        ...state,
        items: action.payload.items,
        totalItems: action.payload.totalItems,
        totalAmount: action.payload.totalAmount,
        isLoading: false,
      };
    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };
    case "OPEN_CART":
      return { ...state, isOpen: true };
    case "CLOSE_CART":
      return { ...state, isOpen: false };
    default:
      return state;
  }
};

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  isLoading: false,
  isOpen: false,
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isSignedIn, user } = useUser();

  const fetchCart = async () => {
    // Temporarily bypass auth for testing
    if (!user) return;

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
        headers: {
          Authorization: `Bearer test-user-123`,
        },
      });

      if (response.ok) {
        const cart = await response.json();
        dispatch({
          type: "SET_CART",
          payload: {
            items: cart.items,
            totalItems: cart.totalItems,
            totalAmount: cart.totalAmount,
          },
        });
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const addItem = async (productId: string, quantity: number) => {
    // Temporarily bypass auth for testing
    if (!user) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/cart/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer test-user-123`,
          },
          body: JSON.stringify({ productId, quantity }),
        },
      );

      if (response.ok) {
        const cart = await response.json();
        dispatch({
          type: "SET_CART",
          payload: {
            items: cart.items,
            totalItems: cart.totalItems,
            totalAmount: cart.totalAmount,
          },
        });
      }
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    }
  };

  const updateItem = async (itemId: string, quantity: number) => {
    if (!isSignedIn || !user) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/cart/items/${itemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer test-user-123`,
          },
          body: JSON.stringify({ quantity }),
        },
      );

      if (response.ok) {
        const cart = await response.json();
        dispatch({
          type: "SET_CART",
          payload: {
            items: cart.items,
            totalItems: cart.totalItems,
            totalAmount: cart.totalAmount,
          },
        });
      }
    } catch (error) {
      console.error("Failed to update cart item:", error);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!isSignedIn || !user) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/cart/items/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer test-user-123`,
          },
        },
      );

      if (response.ok) {
        const cart = await response.json();
        dispatch({
          type: "SET_CART",
          payload: {
            items: cart.items,
            totalItems: cart.totalItems,
            totalAmount: cart.totalAmount,
          },
        });
      }
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
    }
  };

  const clearCart = async () => {
    if (!isSignedIn || !user) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer test-user-123`,
        },
      });

      if (response.ok) {
        const cart = await response.json();
        dispatch({
          type: "SET_CART",
          payload: {
            items: cart.items,
            totalItems: cart.totalItems,
            totalAmount: cart.totalAmount,
          },
        });
      }
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  };

  const toggleCart = () => dispatch({ type: "TOGGLE_CART" });
  const openCart = () => dispatch({ type: "OPEN_CART" });
  const closeCart = () => dispatch({ type: "CLOSE_CART" });

  useEffect(() => {
    // Temporarily disable auto-fetch for testing
    dispatch({
      type: "SET_CART",
      payload: { items: [], totalItems: 0, totalAmount: 0 },
    });
  }, []);

  const value: CartContextType = {
    ...state,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    refreshCart: fetchCart,
    toggleCart,
    openCart,
    closeCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
