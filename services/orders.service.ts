import { api } from "@/lib/api";
import type { CreateOrderPayload, Order } from "@/types/order";

export function createOrder(payload: CreateOrderPayload) {
  return api<Order>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getOrders() {
  return api<Order[]>("/orders");
}

export function getOrder(id: string) {
  return api<Order>(`/orders/${id}`);
}

export function cancelOrder(id: string) {
  return api<Order>(`/orders/${id}/cancel`, { method: "PATCH" });
}
