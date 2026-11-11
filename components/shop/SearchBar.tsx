"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SEARCH_DEBOUNCE_MS } from "@/lib/constants";
import { Input } from "@/components/ui/input";

export function SearchBar({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const skipFirst = useRef(true);

  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }

    const handle = window.setTimeout(() => {
      const next = new URLSearchParams(window.location.search);
      const trimmed = value.trim();
      if (trimmed) next.set("search", trimmed);
      else next.delete("search");
      next.delete("page");
      const query = next.toString();
      router.replace(query ? `/shop?${query}` : "/shop");
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [value, router]);

  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Search oils or categories"
      aria-label="Search products"
    />
  );
}
