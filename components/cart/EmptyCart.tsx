import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EmptyCart() {
  return (
    <div className="rounded-2xl bg-white p-10 text-center">
      <p className="font-display text-2xl">Your cart is empty.</p>
      <Link href="/shop" className="mt-6 inline-block">
        <Button>Start shopping</Button>
      </Link>
    </div>
  );
}
