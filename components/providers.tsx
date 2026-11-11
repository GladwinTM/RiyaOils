"use client";

import { CartProvider } from "@/features/cart/cart.store";

export function Providers({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
