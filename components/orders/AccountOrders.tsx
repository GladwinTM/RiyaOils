"use client";

import { ACCESS_TOKEN_KEY } from "@/lib/constants";
import { listGuestOrders } from "@/lib/guest-orders";
import { getOrders } from "@/services/orders.service";
import type { Order } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { formatInr } from "@/lib/utils";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function readToken() {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY) ?? "";
}

function readGuest() {
  return listGuestOrders();
}

export function AccountOrders() {
  const storedToken = useSyncExternalStore(subscribe, readToken, () => "");
  const guest = useSyncExternalStore(subscribe, readGuest, () => []);

  return <AccountOrdersForm key={storedToken} initialToken={storedToken} guest={guest} />;
}

function AccountOrdersForm({
  initialToken,
  guest,
}: {
  initialToken: string;
  guest: Order[];
}) {
  const [token, setToken] = useState(initialToken);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadAccountOrders(value: string) {
    if (!value.trim()) {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
      setOrders([]);
      setError(null);
      return;
    }
    setLoading(true);
    try {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, value.trim());
      setError(null);
      const data = await getOrders();
      setOrders(data);
    } catch {
      setError(
        "Could not load account orders. The session may have expired — sign in again and retry.",
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <form
        className="rounded-2xl bg-white p-5"
        onSubmit={(e) => {
          e.preventDefault();
          void loadAccountOrders(token);
        }}
      >
        <Label htmlFor="token">Account access token (optional)</Label>
        <Input
          id="token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Supabase session access token"
        />
        <p className="mt-2 text-xs text-zinc-500">
          Guest checkout does not need this. Orders placed on this device are
          listed below automatically.
        </p>
        <Button type="submit" className="mt-4" disabled={loading}>
          {loading ? "Loading orders…" : "Save token & load orders"}
        </Button>
        {error ? <p className="mt-2 text-sm text-riya">{error}</p> : null}
      </form>

      <section>
        <h2 className="mb-3 font-medium">Account orders</h2>
        {!orders.length ? (
          <p className="text-sm text-zinc-600">
            No account orders loaded yet. Save a token above to fetch them.
          </p>
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => (
              <li key={order.id} className="rounded-xl bg-white p-4">
                <p className="font-medium">{order.order_number}</p>
                <p className="text-sm text-zinc-600">
                  {order.status} · {formatInr(order.total)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-medium">Orders placed on this device</h2>
        {!guest.length ? (
          <p className="text-sm text-zinc-600">No guest orders stored yet.</p>
        ) : (
          <ul className="space-y-3">
            {guest.map((order) => (
              <li key={order.id} className="rounded-xl bg-white p-4">
                <Link
                  href={`/order/${order.order_number}`}
                  className="font-medium underline"
                >
                  {order.order_number}
                </Link>
                <p className="text-sm text-zinc-600">
                  {order.status} · {formatInr(order.total)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
