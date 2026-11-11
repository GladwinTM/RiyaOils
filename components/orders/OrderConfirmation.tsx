import Link from "next/link";
import { formatInr } from "@/lib/utils";
import type { Order } from "@/types/order";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge, OrderTimeline } from "@/components/orders/OrderTimeline";

export function OrderConfirmation({ order }: { order: Order }) {
  return (
    <div className="rounded-2xl bg-white p-6">
      <p className="text-xs font-bold tracking-[0.2em] uppercase text-riya">Thank you</p>
      <h1 className="font-display mt-2 text-3xl">Order confirmed!</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Order number: <strong>{order.order_number}</strong>
      </p>
      <div className="mt-4">
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="mt-4 text-sm">Payment: Cash on Delivery</p>
      <p className="mt-2 text-sm text-zinc-700">
        {order.shipping_address}, {order.city}, {order.district}, {order.state} {order.pincode}
      </p>
      <ul className="mt-6 space-y-2 text-sm">
        {(order.items ?? []).map((item) => (
          <li key={item.id} className="flex justify-between">
            <span>
              {item.product_name} · {item.variant_name} × {item.quantity}
            </span>
            <span>{formatInr(item.total_price)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-right text-lg font-semibold">Total {formatInr(order.total)}</p>
      <div className="mt-6">
        <OrderTimeline status={order.status} />
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/shop">
          <Button>Continue shopping</Button>
        </Link>
        <Link href="/track-order">
          <Button variant="secondary">Track order</Button>
        </Link>
      </div>
    </div>
  );
}
