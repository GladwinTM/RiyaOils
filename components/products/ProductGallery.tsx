"use client";

import { ProductImage } from "@/components/products/ProductImage";
import { productImages } from "@/lib/utils";
import type { Product } from "@/types/product";
import { useState } from "react";

export function ProductGallery({ product }: { product: Product }) {
  const images = productImages(product);
  const [active, setActive] = useState(images[0] ?? "");

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-3xl bg-cream">
        <ProductImage src={active} alt={product.name} className="h-full w-full" />
      </div>
      {images.length > 1 ? (
        <div className="mt-3 flex gap-2">
          {images.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(src)}
              className="h-16 w-16 overflow-hidden rounded-xl border"
            >
              <ProductImage src={src} alt="" className="h-full w-full" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
