import Link from "next/link";
import { Sunflower } from "@/components/decorations/Sunflower";
import { Button } from "@/components/ui/button";

const STEPS = [
  { n: "01", title: "Whole seeds", body: "Sesame, groundnut, coconut and sunflower — cleaned and sun-dried." },
  { n: "02", title: "Slow pressed", body: "Cold-pressed at low speed so the oil keeps its aroma and nutrients." },
  { n: "03", title: "Settled & filtered", body: "Rested naturally, filtered, then lab-tested batch by batch." },
];

export function AboutPreview() {
  return (
    <section className="mt-8 grid items-center gap-8 rounded-[2rem] bg-white p-6 md:grid-cols-2 md:p-10">
      <div>
        <h2 className="font-display text-3xl">About Riya</h2>
        <p className="mt-4 text-zinc-700">
          Riya makes cold-pressed cooking oils for everyday South Indian kitchens.
          Clear sizes, honest pricing, and a quick checkout — without extra noise.
        </p>
        <ol className="mt-6 space-y-4">
          {STEPS.map((s) => (
            <li key={s.n} className="flex gap-4">
              <span className="font-display text-xl text-petal tabular-nums">{s.n}</span>
              <div>
                <p className="font-medium">{s.title}</p>
                <p className="text-sm text-zinc-600">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <Link href="/about" className="mt-6 inline-block">
          <Button variant="secondary">Read more</Button>
        </Link>
      </div>
      <div className="seed-texture relative grid h-72 place-items-center overflow-hidden rounded-3xl bg-cream">
        <Sunflower size={200} className="spin-slow opacity-90" />
        <Sunflower size={90} className="float-soft absolute top-6 left-6 opacity-60" />
        <Sunflower size={70} className="float-soft absolute right-8 bottom-6 opacity-50" />
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/80 px-3 py-1 text-xs text-seed">
          Traditional oils, bottled with care
        </p>
      </div>
    </section>
  );
}

export function BrandStatement() {
  return (
    <section className="mt-16 text-center">
      <h2 className="font-display text-3xl">Made for everyday cooking</h2>
      <p className="mx-auto mt-3 max-w-xl text-zinc-700">
        Gingelly, groundnut, coconut and sunflower oils with clear sizes, pricing
        and quick checkout.
      </p>
    </section>
  );
}
