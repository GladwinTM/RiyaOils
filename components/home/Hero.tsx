import Link from "next/link";
import { Leaf } from "lucide-react";
import { HeroDecoration, Sunflower } from "@/components/decorations/Sunflower";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/products/ProductImage";
import { formatInr, productImages, productMinPrice } from "@/lib/utils";
import type { Product } from "@/types/product";

export function Hero({ product }: { product?: Product }) {
  const image = product ? productImages(product)[0] : null;
  const price = product ? productMinPrice(product) : 0;

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-cream px-6 pt-14 pb-20 md:px-12 md:pb-24">
      <HeroDecoration />
      {/* Big slow-turning sunflower behind the product */}
      <Sunflower
        className="spin-slow pointer-events-none absolute -right-24 -bottom-24 hidden opacity-25 md:block"
        size={420}
      />
      <div className="relative z-10 grid items-center gap-10 md:grid-cols-2">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold tracking-wide text-seed">
            <Leaf size={14} aria-hidden="true" /> Cold-pressed · Small batches · Lab-tested
          </p>
          <h1 className="mt-5 font-display text-4xl leading-tight md:text-6xl">
            Pure goodness,
            <br />
            made for <span className="relative whitespace-nowrap text-riya">every kitchen.</span>
          </h1>
          <p className="mt-5 max-w-md text-zinc-700">
            Gingelly, groundnut, coconut and sunflower oils pressed slowly from whole seeds — nothing
            added, nothing taken out.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/shop">
              <Button className="min-h-12 px-8">Shop now</Button>
            </Link>
            <Link href="#quality">
              <Button variant="ghost" className="min-h-12">See our lab results →</Button>
            </Link>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <div className="aspect-square overflow-hidden rounded-[2rem] bg-white shadow-xl ring-8 ring-white/60">
            <ProductImage src={image} alt={product?.name ?? "Riya cooking oil"} className="h-full w-full" />
          </div>
          {product ? (
            <Link
              href={`/shop/${product.slug}`}
              className="absolute -bottom-5 left-4 rounded-2xl bg-white px-4 py-3 text-sm shadow-lg transition hover:-translate-y-0.5"
            >
              <span className="block font-medium">{product.name}</span>
              {price ? <span className="text-xs text-zinc-600">from {formatInr(price)}</span> : null}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
