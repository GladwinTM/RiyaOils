import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";

export default function NotFound() {
  return (
    <PageContainer className="py-16 text-center">
      <h1 className="font-display text-3xl">Page not found</h1>
      <Link href="/shop" className="mt-4 inline-block underline">
        Back to shop
      </Link>
    </PageContainer>
  );
}
