"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function ProductSort() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const value = searchParams.get("sort") ?? "newest";

  return (
    <label className="flex items-center gap-2 text-sm">
      Sort
      <select
        className="min-h-11 rounded-xl border border-black/10 bg-white px-3"
        value={value}
        onChange={(e) => {
          const next = new URLSearchParams(searchParams.toString());
          next.set("sort", e.target.value);
          next.delete("page");
          router.replace(`/shop?${next.toString()}`);
        }}
      >
        <option value="newest">Newest</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
      </select>
    </label>
  );
}
