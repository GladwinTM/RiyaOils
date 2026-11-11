"use client";

import { useCart } from "@/hooks/useCart";
import {
  activeVariants,
  cheapestVariant,
  formatInr,
  isInStock,
  productImages,
  variantPrice,
} from "@/lib/utils";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/products/ProductImage";
import { VariantSelector } from "@/components/products/VariantSelector";
import Link from "next/link";
import { useState } from "react";

export function ProductCard({ product }: { product: Product }) {
  const variants = activeVariants(product);
  const [variantId, setVariantId] = useState(cheapestVariant(product)?.id ?? "");
  const variant = variants.find((v) => v.id === variantId) ?? cheapestVariant(product);
  const { addItem } = useCart();
  const image = productImages(product)[0];
  const inStock = isInStock(variant);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
      <Link href={`/shop/${product.slug}`} className="block aspect-square bg-cream">
        <ProductImage src={image} alt={product.name} className="h-full w-full" />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            {product.categories?.name}
          </p>
          <Link href={`/shop/${product.slug}`} className="font-medium">
            {product.name}
          </Link>
          {variant ? (
            <p className="mt-1 text-lg font-semibold">
              {formatInr(variantPrice(variant))}
              {variant.sale_price ? (
                <span className="ml-2 text-sm font-normal text-zinc-400 line-through">
                  {formatInr(variant.price)}
                </span>
              ) : null}
            </p>
          ) : null}
          <p className="text-xs text-zinc-500">
            {inStock ? `${variant?.stock} in stock` : "Out of stock"}
          </p>
        </div>
        <VariantSelector
          variants={variants}
          value={variant?.id ?? ""}
          onChange={setVariantId}
        />
        <Button
          disabled={!variant || !inStock}
          onClick={() => {
            if (!variant) return;
            addItem({
              productId: product.id,
              variantId: variant.id,
              slug: product.slug,
              productName: product.name,
              variantName: variant.name,
              image: image ?? null,
              price: variantPrice(variant),
              quantity: 1,
              stock: Number(variant.stock),
            });
          }}
        >
          Add to cart
        </Button>
      </div>
    </article>
  );
}
