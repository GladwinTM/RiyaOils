"use client";

import Link from "next/link";
import { ProductImage } from "@/components/products/ProductImage";
import { QuantitySelector } from "@/components/products/QuantitySelector";
import { formatInr } from "@/lib/utils";
import type { CartItem } from "@/types/cart";

export function CartItemRow({
  item,
  onQuantity,
  onRemove,
}: {
  item: CartItem;
  onQuantity: (quantity: number) => void;
  onRemove: () => void;
}) {
  return (
    <article className="flex gap-4 border-b border-black/5 py-4">
      <Link href={`/shop/${item.slug}`} className="h-24 w-24 overflow-hidden rounded-xl bg-cream">
        <ProductImage src={item.image} alt={item.productName} className="h-full w-full" />
      </Link>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href={`/shop/${item.slug}`} className="font-medium">
              {item.productName}
            </Link>
            <p className="text-sm text-zinc-500">{item.variantName}</p>
            <p className="text-sm font-semibold">{formatInr(item.price)}</p>
          </div>
          <button type="button" className="text-sm underline" onClick={onRemove}>
            Remove
          </button>
        </div>
        <QuantitySelector
          value={item.quantity}
          max={item.stock}
          onChange={onQuantity}
        />
      </div>
    </article>
  );
}
