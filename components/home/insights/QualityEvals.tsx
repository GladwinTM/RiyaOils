"use client";

import Link from "next/link";
import { CircleAlert, CircleCheck, FlaskConical } from "lucide-react";
import { ChartTooltip, TooltipRow, useChartTooltip } from "@/components/charts/ChartTooltip";
import { EmptyChart } from "@/components/home/insights/FattyAcidChart";
import type { QualityBatch, QualityParameter } from "@/types/insights";

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** One eval card per product: latest score, trend sparkline, and bullet meters vs limits. */
export function QualityEvals({
  batches,
  parameters,
}: {
  batches: QualityBatch[];
  parameters: QualityParameter[];
}) {
  if (!batches.length) {
    return <EmptyChart message="Batch lab results will appear here once they are published." />;
  }

  const byProduct = new Map<string, QualityBatch[]>();
  for (const b of batches) byProduct.set(b.productSlug, [...(byProduct.get(b.productSlug) ?? []), b]);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[...byProduct.values()].map((list) => (
        <EvalCard key={list[0].productSlug} batches={list} parameters={parameters} />
      ))}
    </div>
  );
}

function EvalCard({ batches, parameters }: { batches: QualityBatch[]; parameters: QualityParameter[] }) {
  const latest = batches[batches.length - 1];
  const previous = batches.length > 1 ? batches[batches.length - 2] : null;
  const delta = previous ? latest.score - previous.score : null;

  return (
    <article className="flex flex-col rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
      <header className="flex items-start justify-between gap-3">
        <div>
          <Link href={`/shop/${latest.productSlug}`} className="font-medium hover:text-riya">
            {latest.productName}
          </Link>
          <p className="mt-0.5 text-xs text-chart-muted">
            Batch {latest.batchCode} · {formatDate(latest.testedOn)}
          </p>
        </div>
        {latest.passed ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-good/10 px-2.5 py-1 text-xs font-semibold text-good">
            <CircleCheck size={14} aria-hidden="true" /> Within limits
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-warn/10 px-2.5 py-1 text-xs font-semibold text-warn">
            <CircleAlert size={14} aria-hidden="true" /> Review
          </span>
        )}
      </header>

      <div className="mt-4 flex items-end gap-4">
        <div>
          <p className="font-display text-5xl leading-none tabular-nums">{latest.score}</p>
          <p className="mt-1 text-xs text-chart-muted">
            freshness score / 100
            {delta !== null && delta !== 0 ? (
              <span className="ml-1 font-semibold text-ink">
                {delta > 0 ? "▲" : "▼"} {Math.abs(delta)}
              </span>
            ) : null}
          </p>
        </div>
        <ScoreSparkline batches={batches} />
      </div>

      <div className="mt-5 space-y-3">
        {parameters.map((param) => (
          <BulletMeter
            key={param.key}
            param={param}
            value={latest.values[param.key as keyof QualityBatch["values"]]}
          />
        ))}
      </div>

      {latest.isSample ? (
        <p className="mt-4 inline-flex items-center gap-1.5 self-start rounded-full bg-cream px-2.5 py-1 text-[11px] text-chart-muted">
          <FlaskConical size={12} aria-hidden="true" /> Sample data
        </p>
      ) : latest.labName ? (
        <p className="mt-4 text-[11px] text-chart-muted">Tested by {latest.labName}</p>
      ) : null}
    </article>
  );
}

function ScoreSparkline({ batches }: { batches: QualityBatch[] }) {
  const { tip, show, hide } = useChartTooltip();
  const W = 160;
  const H = 52;
  const PAD = 6;
  const scores = batches.map((b) => b.score);
  const lo = Math.max(0, Math.min(...scores) - 10);
  const hi = Math.min(100, Math.max(...scores) + 5);
  const x = (i: number) => (batches.length === 1 ? W / 2 : PAD + (i * (W - PAD * 2)) / (batches.length - 1));
  const y = (s: number) => H - PAD - ((s - lo) / Math.max(1, hi - lo)) * (H - PAD * 2);
  const path = batches.map((b, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(b.score).toFixed(1)}`).join(" ");
  const area = `${path} L${x(batches.length - 1)},${H} L${x(0)},${H} Z`;
  const step = batches.length > 1 ? (W - PAD * 2) / (batches.length - 1) : W;

  return (
    <div data-chart className="relative ml-auto w-40" onMouseLeave={hide}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-13 w-full overflow-visible" role="img"
        aria-label={`Freshness score by batch: ${batches.map((b) => `${b.batchCode} ${b.score}`).join(", ")}`}>
        <path d={area} fill="var(--chart-2)" opacity={0.14} />
        <path d={path} fill="none" stroke="var(--petal)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {batches.map((b, i) => (
          <g key={b.batchCode}>
            <circle
              cx={x(i)}
              cy={y(b.score)}
              r={i === batches.length - 1 ? 4 : 2.5}
              fill={i === batches.length - 1 ? "var(--seed)" : "var(--petal)"}
              stroke="white"
              strokeWidth={2}
            />
            {/* Hit target wider than the mark */}
            <rect
              x={x(i) - step / 2}
              y={0}
              width={step}
              height={H}
              fill="transparent"
              onMouseMove={(e) =>
                show(e as unknown as React.MouseEvent, (
                  <>
                    <p className="mb-1 font-semibold">{b.batchCode}</p>
                    <TooltipRow label="Tested" value={formatDate(b.testedOn)} />
                    <TooltipRow color="var(--petal)" label="Score" value={`${b.score}`} />
                  </>
                ))
              }
            />
          </g>
        ))}
      </svg>
      <ChartTooltip tip={tip} />
    </div>
  );
}

function BulletMeter({ param, value }: { param: QualityParameter; value: number }) {
  const ratio = Math.min(1, value / param.max_limit);
  const headroom = Math.max(0, Math.round((1 - value / param.max_limit) * 100));
  return (
    <div title={param.description ?? undefined}>
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-zinc-700">{param.label}</span>
        <span className="tabular-nums text-chart-muted">
          <span className="font-semibold text-ink">{value}</span> / ≤ {param.max_limit} {param.unit}
        </span>
      </div>
      <div
        className="relative mt-1 h-2 rounded-full bg-chart-grid"
        role="meter"
        aria-label={`${param.label}`}
        aria-valuemin={0}
        aria-valuemax={param.max_limit}
        aria-valuenow={value}
        aria-valuetext={`${value} ${param.unit}, ${headroom}% below the limit`}
      >
        <div className="grow-x h-full rounded-full bg-chart-1" style={{ width: `${Math.max(2, ratio * 100)}%` }} />
        <span className="absolute -top-1 right-0 h-4 w-0.5 rounded bg-ink/60" aria-hidden="true" />
      </div>
      <p className="mt-0.5 text-[10px] text-chart-muted">{headroom}% below the limit</p>
    </div>
  );
}
