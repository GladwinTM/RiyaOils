"use client";

import { useEffect, useState } from "react";
import { LOADING_MESSAGES } from "@/lib/constants";
import { FloatingSunflower } from "@/components/decorations/Sunflower";

export function PageLoading({
  title = "Loading the page…",
}: {
  title?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % LOADING_MESSAGES.length);
    }, 1600);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <FloatingSunflower size={64} />
      <p className="font-display text-2xl text-ink">{title}</p>
      <p
        className="min-h-6 text-sm text-zinc-600 transition-opacity duration-300"
        aria-live="polite"
      >
        {LOADING_MESSAGES[index]}
      </p>
      <div className="mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-black/5">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-riya/80" />
      </div>
    </div>
  );
}
