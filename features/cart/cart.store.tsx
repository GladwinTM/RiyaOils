"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { CART_STORAGE_KEY } from "@/lib/constants";
import type { CartItem, CartState } from "@/types/cart";
import {
  addCartItem,
  cartCount,
  cartSubtotal,
  emptyCart,
  removeCartItem,
  updateCartQuantity,
} from "@/features/cart/cart.utils";

type CartContextValue = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  isReady: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);
const SERVER_CART: CartState = { items: [] };
const listeners = new Set<() => void>();
let memoryCart: CartState = SERVER_CART;
let hydrated = false;

function emit() {
  listeners.forEach((listener) => listener());
}

function fromStorage(): CartState {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return emptyCart();
    const parsed = JSON.parse(raw) as CartState;
    return Array.isArray(parsed.items) ? parsed : emptyCart();
  } catch {
    return emptyCart();
  }
}

function persist(next: CartState) {
  memoryCart = next;
  hydrated = true;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  if (!hydrated) {
    memoryCart = fromStorage();
    hydrated = true;
  }
  return memoryCart;
}

function getServerSnapshot() {
  return SERVER_CART;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addItem = useCallback((item: CartItem) => {
    persist(addCartItem(getSnapshot(), item));
  }, []);

  const removeItem = useCallback((variantId: string) => {
    persist(removeCartItem(getSnapshot(), variantId));
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    persist(updateCartQuantity(getSnapshot(), variantId, quantity));
  }, []);

  const clearCart = useCallback(() => persist(emptyCart()), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getItemCount: () => cartCount(state),
      getSubtotal: () => cartSubtotal(state),
      isReady: true,
    }),
    [state, addItem, removeItem, updateQuantity, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
