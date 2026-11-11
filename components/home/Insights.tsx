import { Droplets, FlaskConical, Package, Sun } from "lucide-react";
import { Sunflower } from "@/components/decorations/Sunflower";
import { FattyAcidChart } from "@/components/home/insights/FattyAcidChart";
import { QualityEvals } from "@/components/home/insights/QualityEvals";
import { SmokePointChart } from "@/components/home/insights/SmokePointChart";
import { formatInr } from "@/lib/utils";
import type { HomeInsights } from "@/types/insights";

export function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="max-w-2xl">
      <p className="flex items-center gap-2 text-xs font-bold tracking-[0.3em] text-seed uppercase">
        <Sunflower size={18} className="drop-shadow-none" /> {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-3xl leading-tight md:text-4xl">{title}</h2>
      {children ? <p className="mt-3 text-zinc-700">{children}</p> : null}
    </div>
  );
}

/** Headline numbers under the hero. */
export function StatStrip({ insights }: { insights: HomeInsights }) {
  const s = insights.summary;
  const stats = [
    { icon: Sun, value: String(s.oilCount), label: "Cold-pressed oils" },
    { icon: Package, value: String(s.packSizes), label: "Pack sizes in stock" },
    { icon: Droplets, value: `${s.litresInStock.toLocaleString("en-IN")} L`, label: "Ready to ship" },
    {
      icon: FlaskConical,
      value: s.passRate === null ? "—" : `${s.passRate}%`,
      label: `of ${s.batchesTested} tested batches within limits`,
    },
  ];
  return (
    <section aria-label="Riya at a glance" className="relative z-10 -mt-8 px-3 md:px-8">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-black/5 bg-black/5 shadow-sm md:grid-cols-4">
        {stats.map(({ icon: Icon, value, label }) => (
          <div key={label} className="bg-white p-5">
            <Icon size={18} className="text-petal" aria-hidden="true" />
            <dd className="mt-3 font-display text-3xl tabular-nums">{value}</dd>
            <dt className="mt-1 text-xs text-zinc-600">{label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}

function ReadyToShip({ insights }: { insights: HomeInsights }) {
  const rows = [...insights.oils].sort((a, b) => b.litresInStock - a.litresInStock);
  const max = Math.max(1, ...rows.map((r) => r.litresInStock));
  return (
    <ul className="space-y-4">
      {rows.map((o, i) => (
        <li key={o.slug}>
          <div className="flex items-baseline justify-between text-sm">
            <span>{o.name}</span>
            <span className="text-xs text-chart-muted">
              {o.minPricePerLitre ? `from ${formatInr(o.minPricePerLitre)}/L` : "Coming soon"}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-3">
            <div className="h-3 flex-1 rounded-r bg-chart-grid/60">
              <div
                className="grow-x h-full rounded-r bg-chart-1"
                style={{ width: `${(o.litresInStock / max) * 100}%`, animationDelay: `${i * 90}ms` }}
              />
            </div>
            <span className="w-14 text-right text-sm font-semibold tabular-nums">{o.litresInStock} L</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function OilInsights({ insights }: { insights: HomeInsights }) {
  const source = insights.oils.find((o) => o.profile)?.profile?.source;
  return (
    <section className="mt-20">
      <SectionHeading eyebrow="Inside every bottle" title="Pick the right oil for the right dish">
        How each oil is built and how much heat it handles. Typical values for cold-pressed oils.
      </SectionHeading>

      <div className="mt-8 grid gap-4 lg:grid-cols-5">
        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm lg:col-span-3">
          <h3 className="font-medium">Fatty-acid profile</h3>
          <p className="mt-1 text-xs text-chart-muted">Share of total fat, %</p>
          <div className="mt-4">
            <FattyAcidChart oils={insights.oils} />
          </div>
        </div>
        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="font-medium">Smoke point</h3>
          <p className="mt-1 mb-4 text-xs text-chart-muted">Higher = better for deep frying</p>
          <SmokePointChart oils={insights.oils} />
        </div>
      </div>

      <div className="seed-texture mt-4 grid gap-6 rounded-3xl bg-husk p-6 md:grid-cols-5 md:p-8">
        <div className="md:col-span-2">
          <h3 className="font-display text-2xl">Fresh from the press</h3>
          <p className="mt-2 text-sm text-zinc-700">
            Live stock across every pack size, updated as orders come in. Pressed in small batches so
            nothing sits on a shelf for long.
          </p>
        </div>
        <div className="md:col-span-3">
          <ReadyToShip insights={insights} />
        </div>
      </div>
      {source ? <p className="mt-3 text-[11px] text-chart-muted">{source}.</p> : null}
    </section>
  );
}

export function QualitySection({ insights }: { insights: HomeInsights }) {
  const reference = insights.parameters[0]?.reference;
  return (
    <section className="mt-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading eyebrow="Batch evaluations" title="Every batch is lab-tested">
          We check each pressing for acidity, oxidation and moisture against international limits
          for cold-pressed oils. Lower is fresher — the score shows how far below the limits a batch sits.
        </SectionHeading>
        {insights.summary.allSample ? (
          <p className="max-w-xs rounded-2xl bg-cream px-4 py-3 text-xs text-chart-muted">
            Showing sample results while the first lab reports are uploaded.
          </p>
        ) : null}
      </div>
      <div className="mt-8">
        <QualityEvals batches={insights.batches} parameters={insights.parameters} />
      </div>
      {reference ? <p className="mt-3 text-[11px] text-chart-muted">Limits: {reference}.</p> : null}
    </section>
  );
}
