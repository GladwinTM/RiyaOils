import type { Product, ProductVariant } from "@/types/product";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function toNumber(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function formatInr(value: unknown) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}

export function variantPrice(variant: ProductVariant) {
  const sale = variant.sale_price;
  if (sale !== null && sale !== undefined && toNumber(sale) > 0) {
    return toNumber(sale);
  }
  return toNumber(variant.price);
}

export function activeVariants(product: Product) {
  return (product.product_variants ?? []).filter((v) => v.is_active !== false);
}

export function cheapestVariant(product: Product) {
  const variants = activeVariants(product);
  if (!variants.length) return undefined;
  return [...variants].sort((a, b) => variantPrice(a) - variantPrice(b))[0];
}

export function productMinPrice(product: Product) {
  const variant = cheapestVariant(product);
  return variant ? variantPrice(variant) : 0;
}

export function productImages(product: Product) {
  const extras = Array.isArray(product.images) ? product.images : [];
  return [...new Set([product.thumbnail_url, ...extras].filter(Boolean))] as string[];
}

export function isInStock(variant?: ProductVariant) {
  return Boolean(variant && variant.is_active !== false && toNumber(variant.stock) > 0);
}
