"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export function CartIcon() {
  const { getItemCount, isReady } = useCart();
  const count = isReady ? getItemCount() : 0;

  return (
    <Link
      href="/cart"
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-black/5"
      aria-label={`Cart, ${count} items`}
    >
      <ShoppingBag size={20} />
      {count > 0 ? (
        <span className="absolute right-1 top-1 min-w-4 rounded-full bg-riya px-1 text-center text-[10px] font-bold text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
