import { api } from "@/lib/api";
import type { Paginated } from "@/types/api";
import type { Product, ProductQuery } from "@/types/product";

function qs(query: ProductQuery = {}) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.category) params.set("category", query.category);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.sort) params.set("sort", query.sort);
  const value = params.toString();
  return value ? `?${value}` : "";
}

export function getProducts(query: ProductQuery = {}) {
  return api<Paginated<Product>>(`/products${qs(query)}`);
}

export function getProduct(slugOrId: string) {
  return api<Product>(`/products/${encodeURIComponent(slugOrId)}`);
}

export function searchProducts(search: string) {
  return getProducts({ search, page: 1, limit: 20 });
}

export function getProductsByCategory(category: string) {
  return getProducts({ category, page: 1, limit: 20 });
}
