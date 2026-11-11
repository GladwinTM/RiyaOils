import type { CartItem, CartState } from "@/types/cart";

export function emptyCart(): CartState {
  return { items: [] };
}

export function addCartItem(state: CartState, item: CartItem): CartState {
  const existing = state.items.find((i) => i.variantId === item.variantId);
  if (existing) {
    const quantity = Math.min(existing.quantity + item.quantity, existing.stock);
    return {
      items: state.items.map((i) =>
        i.variantId === item.variantId ? { ...i, quantity } : i,
      ),
    };
  }
  return { items: [...state.items, { ...item, quantity: Math.min(item.quantity, item.stock) }] };
}

export function updateCartQuantity(
  state: CartState,
  variantId: string,
  quantity: number,
): CartState {
  if (quantity < 1) {
    return { items: state.items.filter((i) => i.variantId !== variantId) };
  }
  return {
    items: state.items.map((i) =>
      i.variantId === variantId
        ? { ...i, quantity: Math.min(quantity, i.stock) }
        : i,
    ),
  };
}

export function removeCartItem(state: CartState, variantId: string): CartState {
  return { items: state.items.filter((i) => i.variantId !== variantId) };
}

export function cartCount(state: CartState) {
  return state.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartSubtotal(state: CartState) {
  return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function orderItems(state: CartState) {
  return state.items.map((item) => ({
    variantId: item.variantId,
    quantity: item.quantity,
  }));
}
