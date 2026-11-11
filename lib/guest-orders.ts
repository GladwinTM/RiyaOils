import { GUEST_ORDERS_KEY } from "@/lib/constants";
import type { Order } from "@/types/order";

function read(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Order[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
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
