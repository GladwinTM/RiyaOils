import { AboutPreview, BrandStatement } from "@/components/home/AboutPreview";
import { BestSellers } from "@/components/home/BestSellers";
import { Hero } from "@/components/home/Hero";
import { HomeContact } from "@/components/home/HomeContact";
import { OilInsights, QualitySection, StatStrip } from "@/components/home/Insights";
import { FloralDivider } from "@/components/decorations/Sunflower";
import { PageContainer } from "@/components/layout/PageContainer";
import { BackendNotice } from "@/components/ui/BackendNotice";
import { apiSafe } from "@/lib/api.server";
import type { ContactSettings } from "@/types/contact";
import type { Paginated } from "@/types/api";
import type { HomeInsights } from "@/types/insights";
import type { Product } from "@/types/product";

const emptyProducts: Paginated<Product> = {
  items: [],
  pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
};

export default async function HomePage() {
  const [productsResult, contactResult, insightsResult] = await Promise.all([
    apiSafe<Paginated<Product>>("/products?page=1&limit=12", emptyProducts),
    apiSafe<ContactSettings | null>("/content/contact", null),
    apiSafe<HomeInsights | null>("/insights/home", null),
  ]);

  const notice = [productsResult, contactResult, insightsResult].find((r) => !r.ok)?.error ?? null;
  const products = productsResult.data.items;
  const heroProduct = products.find((p) => p.is_featured) ?? products[0];
  const insights = insightsResult.data;

  return (
    <PageContainer className="py-8">
      <BackendNotice message={notice} />
      <Hero product={heroProduct} />
      {insights ? <StatStrip insights={insights} /> : null}
      <BestSellers products={products} />
      {insights ? <OilInsights insights={insights} /> : null}
      {insights ? (
        <div id="quality" className="scroll-mt-20">
          <QualitySection insights={insights} />
        </div>
      ) : null}
      <FloralDivider />
      <AboutPreview />
      <BrandStatement />
      <HomeContact contact={contactResult.data} />
    </PageContainer>
  );
}
