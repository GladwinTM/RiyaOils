"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { CartItemRow } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { Button } from "@/components/ui/button";

export function CartPageView() {
  const { items, updateQuantity, removeItem, getSubtotal, isReady } = useCart();

  if (!isReady) return <div className="h-48 animate-pulse rounded-2xl bg-white" />;
  if (!items.length) return <EmptyCart />;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="rounded-2xl bg-white px-4">
        {items.map((item) => (
          <CartItemRow
            key={item.variantId}
            item={item}
            onQuantity={(quantity) => updateQuantity(item.variantId, quantity)}
            onRemove={() => removeItem(item.variantId)}
          />
        ))}
      </div>
      <aside className="h-fit rounded-2xl bg-white p-5">
        <h2 className="mb-4 font-medium">Summary</h2>
        <CartSummary subtotal={getSubtotal()} />
        <Link href="/checkout" className="mt-6 block">
          <Button className="w-full">Checkout</Button>
        </Link>
      </aside>
    </div>
  );
}
