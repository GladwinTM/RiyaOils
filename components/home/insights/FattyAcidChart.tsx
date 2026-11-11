"use client";

import { useState } from "react";
import { ChartTooltip, TooltipRow, useChartTooltip } from "@/components/charts/ChartTooltip";
import type { OilInsight } from "@/types/insights";

const SERIES = [
  { key: "saturatedPct", label: "Saturated", color: "var(--chart-1)", text: "text-white" },
  { key: "mufaPct", label: "Monounsaturated", color: "var(--chart-2)", text: "text-ink" },
  { key: "pufaPct", label: "Polyunsaturated", color: "var(--chart-3)", text: "text-white" },
] as const;

/** 100% stacked bars: typical fatty-acid split per oil. */
export function FattyAcidChart({ oils }: { oils: OilInsight[] }) {
  const rows = oils.filter((o) => o.profile);
  const { tip, show, hide } = useChartTooltip();
  const [table, setTable] = useState(false);

  if (!rows.length) return <EmptyChart />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-700" aria-label="Legend">
          {SERIES.map((s) => (
            <li key={s.key} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
              {s.label}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setTable((v) => !v)}
          className="text-xs font-semibold text-seed underline-offset-4 hover:underline"
        >
          {table ? "Show chart" : "View as table"}
        </button>
      </div>

      {table ? (
        <table className="mt-4 w-full text-left text-sm">
          <thead className="text-xs text-chart-muted">
            <tr>
              <th className="py-2 font-medium">Oil</th>
              {SERIES.map((s) => (
                <th key={s.key} className="py-2 text-right font-medium">{s.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {rows.map((o) => (
              <tr key={o.slug} className="border-t border-chart-grid">
                <td className="py-2">{o.name}</td>
                {SERIES.map((s) => (
                  <td key={s.key} className="py-2 text-right">{o.profile![s.key].toFixed(1)}%</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div data-chart className="relative mt-5 space-y-5" onMouseLeave={hide}>
          {rows.map((o, rowIndex) => {
            const p = o.profile!;
            const total = SERIES.reduce((n, s) => n + p[s.key], 0);
            const tooltip = (
              <>
                <p className="mb-1 font-semibold">{o.name}</p>
                {SERIES.map((s) => (
                  <TooltipRow key={s.key} color={s.color} label={s.label} value={`${p[s.key].toFixed(1)}%`} />
                ))}
                {total < 99 ? <TooltipRow label="Other" value={`${(100 - total).toFixed(1)}%`} /> : null}
              </>
            );
            return (
              <div
                key={o.slug}
                tabIndex={0}
                aria-label={`${o.name}: ${SERIES.map((s) => `${s.label} ${p[s.key]}%`).join(", ")}`}
                className="group rounded-lg outline-offset-4"
                onMouseMove={(e) => show(e, tooltip)}
                onFocus={(e) => show(e, tooltip)}
                onBlur={hide}
              >
                <div className="mb-1.5 flex items-baseline justify-between text-sm">
                  <span className="font-medium">{o.name}</span>
                  <span className="text-xs text-chart-muted">{p.flavorNote}</span>
                </div>
                <div
                  className="grow-x flex h-6 gap-[2px] overflow-hidden rounded"
                  style={{ animationDelay: `${rowIndex * 90}ms` }}
                >
                  {SERIES.map((s) => {
                    const pct = (p[s.key] / 100) * 100;
                    return (
                      <div
                        key={s.key}
                        className={`flex items-center justify-center text-[11px] font-semibold tabular-nums transition-opacity group-hover:opacity-95 ${s.text}`}
                        style={{ width: `${pct}%`, background: s.color }}
                      >
                        {pct >= 9 ? `${Math.round(p[s.key])}%` : null}
                      </div>
                    );
                  })}
                  {/* Remainder (minor fats) stays neutral so bars all span 100% */}
                  <div className="flex-1 bg-chart-grid" />
                </div>
              </div>
            );
          })}
          <ChartTooltip tip={tip} />
        </div>
      )}
    </div>
  );
}

export function EmptyChart({ message = "Data will appear here once oil profiles are added." }: { message?: string }) {
  return (
    <div className="grid h-40 place-items-center rounded-2xl border border-dashed border-chart-grid text-sm text-chart-muted">
      {message}
    </div>
  );
}
