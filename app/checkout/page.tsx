import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { PageContainer } from "@/components/layout/PageContainer";
import { BackendNotice } from "@/components/ui/BackendNotice";
import { apiSafe } from "@/lib/api.server";
import type { StoreSettings } from "@/types/contact";

export default async function CheckoutPage() {
  const settings = await apiSafe<StoreSettings | null>("/settings", null);

  return (
    <PageContainer className="py-10">
      <h1 className="font-display mb-6 text-4xl">Checkout</h1>
      <BackendNotice
        message={
          settings.ok
            ? null
            : `${settings.error} Shipping totals will be confirmed when you place the order.`
        }
      />
      <CheckoutForm settings={settings.data} />
    </PageContainer>
  );
}
