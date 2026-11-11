import { api } from "@/lib/api";
import type { Category } from "@/types/category";

export function getCategories() {
  return api<Category[]>("/categories");
}
