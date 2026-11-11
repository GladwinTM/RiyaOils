"use client";

import { useCallback, useState } from "react";

export type TooltipState = { x: number; y: number; content: React.ReactNode } | null;

/** Hover/focus tooltip positioned inside a `relative` chart container. */
export function useChartTooltip() {
  const [tip, setTip] = useState<TooltipState>(null);

  const show = useCallback(
    (event: React.MouseEvent | React.FocusEvent, content: React.ReactNode) => {
      const container = (event.currentTarget as HTMLElement).closest<HTMLElement>("[data-chart]");
      if (!container) return;
      const box = container.getBoundingClientRect();
      if ("clientX" in event) {
        setTip({ x: event.clientX - box.left, y: event.clientY - box.top, content });
      } else {
        const target = (event.currentTarget as HTMLElement).getBoundingClientRect();
        setTip({ x: target.left - box.left + target.width / 2, y: target.top - box.top, content });
      }
    },
    [],
  );
  const hide = useCallback(() => setTip(null), []);
  return { tip, show, hide };
}

export function ChartTooltip({ tip }: { tip: TooltipState }) {
  if (!tip) return null;
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-20 min-w-36 -translate-x-1/2 -translate-y-[calc(100%+12px)] rounded-xl border border-black/5 bg-white px-3 py-2 text-xs text-ink shadow-lg"
      style={{ left: tip.x, top: tip.y }}
    >
      {tip.content}
    </div>
  );
}

export function TooltipRow({
  color,
  label,
  value,
}: {
  color?: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-0.5">
      <span className="flex items-center gap-1.5 text-zinc-600">
        {color ? <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} /> : null}
        {label}
      </span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}
