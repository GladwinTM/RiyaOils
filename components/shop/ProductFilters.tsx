"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/types/category";
import { cn } from "@/lib/utils";

export function ProductFilters({ categories }: { categories: Category[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const active = searchParams.get("category") ?? "";

  function setCategory(slug: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (slug) next.set("category", slug);
    else next.delete("category");
    next.delete("page");
    const query = next.toString();
    router.replace(query ? `/shop?${query}` : "/shop");
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
      <button
        type="button"
        onClick={() => setCategory("")}
        className={cn(
          "min-h-10 rounded-full px-4 text-sm",
          !active ? "bg-riya text-white" : "bg-white border border-black/10",
        )}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => setCategory(category.slug)}
          className={cn(
            "min-h-10 rounded-full px-4 text-sm",
            active === category.slug
              ? "bg-riya text-white"
              : "bg-white border border-black/10",
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
