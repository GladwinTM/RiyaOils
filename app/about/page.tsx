import { PageContainer } from "@/components/layout/PageContainer";

export default function AboutPage() {
  return (
    <PageContainer className="py-10">
      <h1 className="font-display text-4xl">About Riya</h1>
      <div className="mt-6 max-w-2xl space-y-4 text-zinc-700">
        <p>
          Riya is a small-batch cooking oil brand focused on oils people actually
          cook with every day — gingelly, groundnut, coconut and sunflower.
        </p>
        <p>
          The storefront is built around clear sizes, current prices from the
          catalogue, and a simple cash-on-delivery checkout. No account is required
          to place an order.
        </p>
      </div>
    </PageContainer>
  );
}
