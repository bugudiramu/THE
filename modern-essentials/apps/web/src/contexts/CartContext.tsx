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
  isSubscription: boolean;
  frequency?: string;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    sku: string;
    price: number;
    subPrice?: number;
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
  addItem: (product: any, quantity: number, isSubscription?: boolean, frequency?: string) => Promise<void>;
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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // Helper to persist to local storage as fallback
  const persistToLocalStorage = (data: { items: CartItem[]; totalItems: number; totalAmount: number }) => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("modern_essentials_cart", JSON.stringify(data));
      }
    } catch (e) {
      console.warn("Could not save to localStorage");
    }
  };

  const fetchCart = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    
    // If logged in, fetch from API
    if (isSignedIn && user) {
      try {
        const token = await (user as any).getToken();
        const res = await fetch(`${apiUrl}/cart`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (res.ok) {
          const cartData = await res.json();
          dispatch({ type: "SET_CART", payload: cartData });
          persistToLocalStorage(cartData);
          return;
        }
      } catch (error) {
        console.error("Failed to fetch cart from API:", error);
      }
    }

    // Fallback to localStorage for guest or if API fails
    try {
      if (typeof window !== "undefined") {
        const saved = window.localStorage.getItem("modern_essentials_cart");
        if (saved) {
          const data = JSON.parse(saved);
          dispatch({ type: "SET_CART", payload: data });
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to parse cart from localStorage");
    }

    dispatch({
      type: "SET_CART",
      payload: { items: [], totalItems: 0, totalAmount: 0 },
    });
  };

  const addItem = async (product: any, quantity: number, isSubscription = false, frequency = "WEEKLY") => {
    dispatch({ type: "SET_LOADING", payload: true });
    
    if (isSignedIn && user) {
      try {
        const token = await (user as any).getToken();
        const res = await fetch(`${apiUrl}/cart/items`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: product.id,
            quantity,
            isSubscription,
            frequency,
          }),
        });

        if (res.ok) {
          const cartData = await res.json();
          dispatch({ type: "SET_CART", payload: cartData });
          persistToLocalStorage(cartData);
          dispatch({ type: "OPEN_CART" });
          return;
        }
      } catch (error) {
        console.error("Failed to add item via API:", error);
      }
    }

    // Guest mode or API failure
    const currentItems = [...state.items];
    const existingIndex = currentItems.findIndex(
      i => i.productId === product.id && i.isSubscription === isSubscription
    );

    if (existingIndex >= 0) {
      currentItems[existingIndex].quantity += quantity;
    } else {
      currentItems.push({
        id: Math.random().toString(36).substring(7),
        productId: product.id,
        quantity,
        priceSnapshot: isSubscription ? (product.subPrice || product.price) : product.price,
        isSubscription,
        frequency: isSubscription ? frequency : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        product: {
          id: product.id,
          name: product.name,
          sku: product.sku || '',
          price: product.price,
          subPrice: product.subPrice,
          images: product.images || []
        }
      });
    }

    const totalItems = currentItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalAmount = currentItems.reduce((acc, item) => acc + (item.quantity * item.priceSnapshot), 0);
    const cartData = { items: currentItems, totalItems, totalAmount };
    
    dispatch({ type: "SET_CART", payload: cartData });
    persistToLocalStorage(cartData);
    dispatch({ type: "OPEN_CART" });
    dispatch({ type: "SET_LOADING", payload: false });
  };

  const updateItem = async (itemId: string, quantity: number) => {
    if (isSignedIn && user) {
      try {
        const token = await (user as any).getToken();
        const res = await fetch(`${apiUrl}/cart/items/${itemId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity }),
        });

        if (res.ok) {
          const cartData = await res.json();
          dispatch({ type: "SET_CART", payload: cartData });
          persistToLocalStorage(cartData);
          return;
        }
      } catch (error) {
        console.error("Failed to update item via API:", error);
      }
    }

    const currentItems = [...state.items];
    const index = currentItems.findIndex(i => i.id === itemId);
    if (index >= 0) {
       currentItems[index].quantity = Math.max(1, quantity);
       const totalItems = currentItems.reduce((acc, item) => acc + item.quantity, 0);
       const totalAmount = currentItems.reduce((acc, item) => acc + (item.quantity * item.priceSnapshot), 0);
       const cartData = { items: currentItems, totalItems, totalAmount };
       dispatch({ type: "SET_CART", payload: cartData });
       persistToLocalStorage(cartData);
    }
  };

  const removeItem = async (itemId: string) => {
    if (isSignedIn && user) {
      try {
        const token = await (user as any).getToken();
        const res = await fetch(`${apiUrl}/cart/items/${itemId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const cartData = await res.json();
          dispatch({ type: "SET_CART", payload: cartData });
          persistToLocalStorage(cartData);
          return;
        }
      } catch (error) {
        console.error("Failed to remove item via API:", error);
      }
    }

    const currentItems = state.items.filter(i => i.id !== itemId);
    const totalItems = currentItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalAmount = currentItems.reduce((acc, item) => acc + (item.quantity * item.priceSnapshot), 0);
    const cartData = { items: currentItems, totalItems, totalAmount };
    dispatch({ type: "SET_CART", payload: cartData });
    persistToLocalStorage(cartData);
  };

  const clearCart = async () => {
    if (isSignedIn && user) {
      try {
        const token = await (user as any).getToken();
        await fetch(`${apiUrl}/cart`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Failed to clear cart via API:", error);
      }
    }
    const cartData = { items: [], totalItems: 0, totalAmount: 0 };
    dispatch({ type: "SET_CART", payload: cartData });
    persistToLocalStorage(cartData);
  };

  const toggleCart = () => dispatch({ type: "TOGGLE_CART" });
  const openCart = () => dispatch({ type: "OPEN_CART" });
  const closeCart = () => dispatch({ type: "CLOSE_CART" });

  useEffect(() => {
    fetchCart();
  }, [isSignedIn]);

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
