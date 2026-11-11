import { api } from "@/lib/api";
import { ORDER_TIMEOUT_MS } from "@/lib/constants";
import type { CreateOrderPayload, Order } from "@/types/order";

/**
 * Reuse the same idempotencyKey for every attempt at the same checkout: the server
 * then returns the already-placed order instead of creating a duplicate.
 */
export function createOrder(payload: CreateOrderPayload, idempotencyKey: string) {
  return api<Order>(
    "/orders",
    {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Idempotency-Key": idempotencyKey },
    },
    { timeoutMs: ORDER_TIMEOUT_MS },
  );
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
