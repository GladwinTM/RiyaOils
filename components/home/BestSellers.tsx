import Link from "next/link";
import { ProductImage } from "@/components/products/ProductImage";
import { SectionHeading } from "@/components/home/Insights";
import { formatInr, productImages, productMinPrice } from "@/lib/utils";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";

export function ProductPreviewCard({ product }: { product: Product }) {
  const price = productMinPrice(product);
  const sizes = (product.product_variants ?? []).filter((v) => v.is_active !== false).map((v) => v.name);
  return (
    <article className="group min-w-[220px] overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="aspect-square overflow-hidden bg-cream">
        <ProductImage
          src={productImages(product)[0]}
          alt={product.name}
          className="h-full w-full transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <p className="text-[11px] font-semibold tracking-widest text-seed/70 uppercase">
          {product.categories?.name}
        </p>
        <h3 className="mt-1 font-medium">{product.name}</h3>
        <div className="mt-1 flex items-baseline justify-between gap-2 text-sm">
          <span className="text-zinc-500">{sizes.join(" · ")}</span>
          {price ? <span className="font-semibold">{formatInr(price)}</span> : null}
        </div>
        <Link href={`/shop/${product.slug}`} className="mt-4 block">
          <Button variant="secondary" className="w-full">
            Explore
          </Button>
        </Link>
      </div>
    </article>
  );
}

export function BestSellers({ products }: { products: Product[] }) {
  // Featured oils lead; the rest fill the row so the grid never looks half-empty.
  const list = [...products]
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured))
    .slice(0, 8);
  if (!list.length) return null;

  return (
    <section className="mt-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading eyebrow="Best sellers" title="The oils our kitchens reach for first" />
        <Link href="/shop" className="text-sm font-semibold text-riya hover:underline">
          View all oils →
        </Link>
      </div>
      <div className="mt-8 flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:overflow-visible">
        {list.map((product) => (
          <ProductPreviewCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
