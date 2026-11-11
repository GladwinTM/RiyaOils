import { GuestOrderView } from "@/components/orders/GuestOrderView";
import { PageContainer } from "@/components/layout/PageContainer";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  return (
    <PageContainer className="py-10">
      <GuestOrderView orderNumber={orderNumber} />
    </PageContainer>
  );
}
