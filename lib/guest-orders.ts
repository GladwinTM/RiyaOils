import { GUEST_ORDERS_KEY } from "@/lib/constants";
import type { Order } from "@/types/order";

const EMPTY: Order[] = [];
let cachedRaw: string | null = null;
let cachedOrders: Order[] = EMPTY;

/**
 * Returns the same array (and the same order objects) until storage changes.
 * useSyncExternalStore snapshots must be referentially stable, otherwise React
 * re-renders forever ("Maximum update depth exceeded").
 */
function read(): Order[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(GUEST_ORDERS_KEY);
    if (raw === cachedRaw) return cachedOrders;
    cachedRaw = raw;
    const parsed = raw ? (JSON.parse(raw) as Order[]) : EMPTY;
    cachedOrders = Array.isArray(parsed) ? parsed : EMPTY;
    return cachedOrders;
  } catch {
    return EMPTY;
  }
}

export function saveGuestOrder(order: Order) {
  const next = [order, ...read().filter((o) => o.id !== order.id)].slice(0, 20);
  window.localStorage.setItem(GUEST_ORDERS_KEY, JSON.stringify(next));
}

export function listGuestOrders() {
  return read();
}

export function findGuestOrder(orderNumber: string, phone?: string) {
  const needle = orderNumber.trim().toLowerCase();
  return read().find((order) => {
    const numberMatch = order.order_number.toLowerCase() === needle;
    if (!numberMatch) return false;
    if (!phone) return true;
    return order.customer_phone.replace(/\D/g, "") === phone.replace(/\D/g, "");
  });
}
