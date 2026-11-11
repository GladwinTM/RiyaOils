import { TrackOrderForm } from "@/components/orders/TrackOrderForm";
import { PageContainer } from "@/components/layout/PageContainer";

export default function TrackOrderPage() {
  return (
    <PageContainer className="py-10">
      <h1 className="font-display mb-6 text-4xl">Track order</h1>
      <p className="mb-6 max-w-xl text-sm text-zinc-600">
        Enter the order number and phone from checkout. Guest orders stay on this
        browser so we never expose other customers’ data.
      </p>
      <TrackOrderForm />
    </PageContainer>
  );
}
