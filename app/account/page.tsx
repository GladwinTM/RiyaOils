import { AccountOrders } from "@/components/orders/AccountOrders";
import { PageContainer } from "@/components/layout/PageContainer";

export default function AccountPage() {
  return (
    <PageContainer className="py-10">
      <h1 className="font-display mb-6 text-4xl">Account</h1>
      <AccountOrders />
    </PageContainer>
  );
}
