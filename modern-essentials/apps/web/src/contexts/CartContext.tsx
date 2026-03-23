"use client";


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
  addItem: (product: any, quantity: number) => Promise<void>;
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

  // Helper to persist to local storage seamlessly
  const persistCart = (items: CartItem[]) => {
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    const totalAmount = items.reduce((acc, item) => acc + (item.quantity * item.product.price), 0);
    const cartData = { items, totalItems, totalAmount };
    
    dispatch({ type: "SET_CART", payload: cartData });
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("modern_essentials_cart", JSON.stringify(cartData));
      }
    } catch (e) {
      console.warn("Could not save to localStorage");
    }
  };

  const fetchCart = async () => {
    // Only fetch from localStorage for robust frontend UX
    try {
      if (typeof window !== "undefined") {
        const saved = window.localStorage.getItem("modern_essentials_cart");
        if (saved) {
          dispatch({ type: "SET_CART", payload: JSON.parse(saved) });
          return;
        }
      }
      dispatch({
        type: "SET_CART",
        payload: { items: [], totalItems: 0, totalAmount: 0 },
      });
    } catch (e) {
      dispatch({ type: "SET_CART", payload: { items: [], totalItems: 0, totalAmount: 0 } });
    }
  };

  const addItem = async (product: any, quantity: number) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const currentItems = [...state.items];
      const existingIndex = currentItems.findIndex(i => i.productId === product.id);

      if (existingIndex >= 0) {
        currentItems[existingIndex].quantity += quantity;
      } else {
        currentItems.push({
          id: Math.random().toString(),
          productId: product.id,
          quantity,
          priceSnapshot: product.price,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          product: {
            id: product.id,
            name: product.name,
            sku: product.sku || '',
            price: product.price,
            images: product.images || []
          }
        });
      }
      
      persistCart(currentItems);
      dispatch({ type: "OPEN_CART" }); // Instantly pop open the cart drawer!
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const updateItem = async (itemId: string, quantity: number) => {
    const currentItems = [...state.items];
    const index = currentItems.findIndex(i => i.id === itemId);
    if (index >= 0) {
       currentItems[index].quantity = Math.max(1, quantity);
       persistCart(currentItems);
    }
  };

  const removeItem = async (itemId: string) => {
    const currentItems = state.items.filter(i => i.id !== itemId);
    persistCart(currentItems);
  };

  const clearCart = async () => {
    persistCart([]);
  };

  const toggleCart = () => dispatch({ type: "TOGGLE_CART" });
  const openCart = () => dispatch({ type: "OPEN_CART" });
  const closeCart = () => dispatch({ type: "CLOSE_CART" });

  useEffect(() => {
    // Safely hydrate the persisted cart from localStorage across checkouts
    fetchCart();
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
