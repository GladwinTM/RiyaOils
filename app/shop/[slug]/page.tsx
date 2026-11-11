import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductInfo } from "@/components/products/ProductInfo";
import { BackendNotice } from "@/components/ui/BackendNotice";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { serverApi } from "@/lib/api.server";
import type { Paginated } from "@/types/api";
import type { Product } from "@/types/product";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let product: Product | null = null;
  let loadError: string | null = null;

  try {
    product = await serverApi<Product>(`/products/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    loadError =
      error instanceof ApiError
        ? error.message
        : "Could not load this product right now.";
  }

  if (!product) {
    return (
      <PageContainer className="py-10">
        <BackendNotice message={loadError} />
        <div className="rounded-2xl bg-white p-8 text-center">
          <h1 className="font-display text-3xl">Product unavailable</h1>
          <p className="mt-2 text-sm text-zinc-600">
            The store took too long or is offline. Try again in a moment.
          </p>
          <Link href="/shop" className="mt-6 inline-block">
            <Button>Back to shop</Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const related = await serverApi<Paginated<Product>>(
    `/products?limit=8&category=${encodeURIComponent(product.categories?.slug ?? "")}`,
  )
    .then((res) =>
      res.items.filter((item) => item.id !== product.id).slice(0, 4),
    )
    .catch(() => [] as Product[]);

  return (
    <PageContainer className="py-10">
      <ProductInfo product={product} related={related} />
    </PageContainer>
  );
}
