"use client";

import { Button } from "@/components/ui/button";

export function AddToCartButton({
  disabled,
  onClick,
}: {
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Button disabled={disabled} onClick={onClick} className="w-full sm:w-auto">
      Add to cart
    </Button>
  );
}
