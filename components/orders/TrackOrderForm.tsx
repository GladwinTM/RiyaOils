"use client";

import { useState } from "react";
import { findGuestOrder } from "@/lib/guest-orders";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OrderConfirmation } from "@/components/orders/OrderConfirmation";
import type { Order } from "@/types/order";

export function TrackOrderForm() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = findGuestOrder(orderNumber, phone);
    if (!found) {
      setOrder(null);
      setError("No matching order was found on this device.");
      return;
    }
    setError(null);
    setOrder(found);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="max-w-md space-y-4 rounded-2xl bg-white p-5">
        <div>
          <Label htmlFor="orderNumber">Order number</Label>
          <Input
            id="orderNumber"
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="RIYA-..."
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        {error ? <p className="text-sm text-riya">{error}</p> : null}
        <Button type="submit">Look up</Button>
      </form>
      {order ? <OrderConfirmation order={order} /> : null}
    </div>
  );
}
