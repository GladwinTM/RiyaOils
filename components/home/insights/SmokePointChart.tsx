"use client";

import { ChartTooltip, TooltipRow, useChartTooltip } from "@/components/charts/ChartTooltip";
import { EmptyChart } from "@/components/home/insights/FattyAcidChart";
import type { OilInsight } from "@/types/insights";

const MAX_C = 250;
const TICKS = [0, 50, 100, 150, 200, 250];

/** Horizontal bars: typical smoke point of each oil, single series. */
export function SmokePointChart({ oils }: { oils: OilInsight[] }) {
  const rows = oils
    .filter((o) => o.profile)
    .sort((a, b) => b.profile!.smokePointC - a.profile!.smokePointC);
  const { tip, show, hide } = useChartTooltip();

  if (!rows.length) return <EmptyChart />;

  return (
    <div data-chart className="relative" onMouseLeave={hide}>
      <div className="relative">
        {/* Recessive grid */}
        <div className="pointer-events-none absolute inset-y-0 left-28 right-12" aria-hidden="true">
          {TICKS.map((t) => (
            <span
              key={t}
              className="absolute inset-y-0 w-px bg-chart-grid"
              style={{ left: `${(t / MAX_C) * 100}%` }}
            />
          ))}
        </div>

        <ul className="relative space-y-3">
          {rows.map((o, i) => {
            const p = o.profile!;
            const tooltip = (
              <>
                <p className="mb-1 font-semibold">{o.name}</p>
                <TooltipRow color="var(--chart-2)" label="Smoke point" value={`${p.smokePointC} °C`} />
                {p.bestFor ? <p className="mt-1 max-w-48 text-zinc-600">Best for: {p.bestFor}</p> : null}
              </>
            );
            return (
              <li
                key={o.slug}
                tabIndex={0}
                aria-label={`${o.name}: smoke point ${p.smokePointC} degrees Celsius`}
                className="flex items-center gap-3 rounded outline-offset-2"
                onMouseMove={(e) => show(e, tooltip)}
                onFocus={(e) => show(e, tooltip)}
                onBlur={hide}
              >
                <span className="w-25 shrink-0 truncate text-sm">{o.name}</span>
                <div className="relative h-5 flex-1">
                  <div
                    className="grow-x h-full rounded-r bg-chart-2"
                    style={{ width: `${(p.smokePointC / MAX_C) * 100}%`, animationDelay: `${i * 90}ms` }}
                  />
                </div>
                <span className="w-9 text-right text-sm font-semibold tabular-nums">{p.smokePointC}°</span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="relative ml-28 mr-12 mt-2 h-4 text-[10px] text-chart-muted" aria-hidden="true">
        {TICKS.map((t) => (
          <span key={t} className="absolute -translate-x-1/2 tabular-nums" style={{ left: `${(t / MAX_C) * 100}%` }}>
            {t}
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs text-chart-muted">°C, unrefined / cold-pressed. Stay below it when cooking.</p>
      <ChartTooltip tip={tip} />
    </div>
  );
}
