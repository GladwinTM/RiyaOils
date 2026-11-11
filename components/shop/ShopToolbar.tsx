"use client";

import { useSearchParams } from "next/navigation";
import { ProductFilters } from "@/components/shop/ProductFilters";
import { ProductSort } from "@/components/shop/ProductSort";
import { SearchBar } from "@/components/shop/SearchBar";
import type { Category } from "@/types/category";

export function ShopToolbar({ categories }: { categories: Category[] }) {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";

  return (
    <div className="mb-8 space-y-4">
      <SearchBar key={search} initial={search} />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <ProductFilters categories={categories} />
        <ProductSort />
      </div>
    </div>
  );
}
