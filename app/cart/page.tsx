import { CartPageView } from "@/components/cart/CartPageView";
import { PageContainer } from "@/components/layout/PageContainer";

export default function CartPage() {
  return (
    <PageContainer className="py-10">
      <h1 className="font-display mb-6 text-4xl">Cart</h1>
      <CartPageView />
    </PageContainer>
  );
}
