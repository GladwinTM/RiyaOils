"use client";

import type { ProductVariant } from "@/types/product";
import { cn } from "@/lib/utils";

export function VariantSelector({
  variants,
  value,
  onChange,
}: {
  variants: ProductVariant[];
  value: string;
  onChange: (id: string) => void;
}) {
  if (!variants.length) return null;

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Choose size">
      {variants.map((variant) => (
        <button
          key={variant.id}
          type="button"
          onClick={() => onChange(variant.id)}
          className={cn(
            "min-h-10 rounded-full border px-3 text-sm",
            value === variant.id
              ? "border-riya bg-riya text-white"
              : "border-black/10 bg-cream",
          )}
        >
          {variant.name}
        </button>
      ))}
    </div>
  );
}
