"use client";

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import {
  activeVariants,
  cheapestVariant,
  formatInr,
  isInStock,
  productImages,
  toNumber,
  variantPrice,
} from "@/lib/utils";
import type { Product } from "@/types/product";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { ProductGallery } from "@/components/products/ProductGallery";
import { QuantitySelector } from "@/components/products/QuantitySelector";
import { StockStatus } from "@/components/products/StockStatus";
import { VariantSelector } from "@/components/products/VariantSelector";
import { ProductCard } from "@/components/shop/ProductCard";

export function ProductInfo({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const variants = activeVariants(product);
  const [variantId, setVariantId] = useState(cheapestVariant(product)?.id ?? "");
  const [qty, setQty] = useState(1);
  const variant = variants.find((v) => v.id === variantId) ?? cheapestVariant(product);
  const { addItem } = useCart();
  const inStock = isInStock(variant);

  return (
    <div>
      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery product={product} />
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            {product.categories?.name}
          </p>
          <h1 className="font-display mt-2 text-4xl">{product.name}</h1>
          {variant ? (
            <p className="mt-4 text-2xl font-semibold">
              {formatInr(variantPrice(variant))}
              {variant.sale_price ? (
                <span className="ml-3 text-base font-normal text-zinc-400 line-through">
                  {formatInr(variant.price)}
                </span>
              ) : null}
            </p>
          ) : null}
          <p className="mt-4 text-zinc-700">{product.short_description}</p>
          <div className="mt-6 space-y-4">
            <VariantSelector variants={variants} value={variant?.id ?? ""} onChange={setVariantId} />
            <QuantitySelector
              value={qty}
              max={Math.max(1, toNumber(variant?.stock))}
              onChange={setQty}
            />
            <StockStatus stock={toNumber(variant?.stock)} />
            <AddToCartButton
              disabled={!variant || !inStock}
              onClick={() => {
                if (!variant) return;
                addItem({
                  productId: product.id,
                  variantId: variant.id,
                  slug: product.slug,
                  productName: product.name,
                  variantName: variant.name,
                  image: productImages(product)[0] ?? null,
                  price: variantPrice(variant),
                  quantity: qty,
                  stock: toNumber(variant.stock),
                });
              }}
            />
          </div>
          <div className="mt-8 space-y-3 text-sm text-zinc-700">
            <p>{product.description}</p>
            {product.ingredients ? <p>Ingredients: {product.ingredients}</p> : null}
            {product.weight ? <p>Weight: {product.weight}</p> : null}
            {variant ? <p>SKU: {variant.sku}</p> : null}
          </div>
        </div>
      </div>
      {related.length ? (
        <section className="mt-16">
          <h2 className="mb-4 font-display text-2xl">Related products</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
