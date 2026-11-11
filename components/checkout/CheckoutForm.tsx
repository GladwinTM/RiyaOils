"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useCart } from "@/hooks/useCart";
import { saveGuestOrder } from "@/lib/guest-orders";
import { formatInr, toNumber } from "@/lib/utils";
import { orderItems } from "@/features/cart/cart.utils";
import { ApiError } from "@/lib/api";
import { createOrder } from "@/services/orders.service";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { ProductImage } from "@/components/products/ProductImage";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import type { StoreSettings } from "@/types/contact";

type FormState = {
  name: string;
  phone: string;
  email: string;
  addressLine: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
};

const initial: FormState = {
  name: "",
  phone: "",
  email: "",
  addressLine: "",
  city: "",
  district: "",
  state: "Tamil Nadu",
  pincode: "",
};

export function CheckoutForm({ settings }: { settings: StoreSettings | null }) {
  const { items, getSubtotal, clearCart, isReady } = useCart();
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const estimate = useMemo(() => {
    const subtotal = getSubtotal();
    if (!settings) return { subtotal, shipping: undefined as number | undefined, total: undefined as number | undefined };
    const threshold = toNumber(settings.free_shipping_threshold);
    const fee = toNumber(settings.shipping_fee);
    const shipping = subtotal >= threshold ? 0 : fee;
    return { subtotal, shipping, total: subtotal + shipping };
  }, [getSubtotal, settings]);

  if (!isReady) return <div className="h-64 animate-pulse rounded-2xl bg-white" />;
  if (!items.length) return <EmptyCart />;

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const order = await createOrder({
        items: orderItems({ items }),
        customer: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
        },
        shippingAddress: {
          addressLine: form.addressLine.trim(),
          city: form.city.trim(),
          district: form.district.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        },
      });
      saveGuestOrder(order);
      clearCart();
      router.push(`/order/${encodeURIComponent(order.order_number)}`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "We couldn't place your order. Your cart has not been cleared.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        <section className="rounded-2xl bg-white p-5">
          <h2 className="mb-4 font-medium">Customer information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" required value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                required
                inputMode="numeric"
                pattern="\d{10,15}"
                title="10 to 15 digits"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5">
          <h2 className="mb-4 font-medium">Delivery address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                required
                value={form.addressLine}
                onChange={(e) => set("addressLine", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" required value={form.city} onChange={(e) => set("city", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                required
                value={form.district}
                onChange={(e) => set("district", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" required value={form.state} onChange={(e) => set("state", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                required
                pattern="\d{6}"
                title="6 digit pincode"
                value={form.pincode}
                onChange={(e) => set("pincode", e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5">
          <h2 className="mb-2 font-medium">Payment</h2>
          <p className="text-sm text-zinc-600">Cash on Delivery</p>
        </section>
      </div>

      <aside className="h-fit rounded-2xl bg-white p-5">
        <h2 className="mb-4 font-medium">Order summary</h2>
        <ul className="mb-4 space-y-3">
          {items.map((item) => (
            <li key={item.variantId} className="flex gap-3 text-sm">
              <div className="h-14 w-14 overflow-hidden rounded-lg bg-cream">
                <ProductImage src={item.image} alt="" className="h-full w-full" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.productName}</p>
                <p className="text-zinc-500">
                  {item.variantName} × {item.quantity}
                </p>
              </div>
              <p>{formatInr(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <CartSummary
          subtotal={estimate.subtotal}
          shipping={estimate.shipping}
          total={estimate.total}
        />
        {error ? (
          <p className="mt-4 text-sm text-riya" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={pending} className="mt-6 w-full min-h-12">
          {pending ? "Placing order…" : "Place order"}
        </Button>
      </aside>
    </form>
  );
}
