import { formatInr } from "@/lib/utils";

export function CartSummary({
  subtotal,
  shipping,
  total,
}: {
  subtotal: number;
  shipping?: number;
  total?: number;
}) {
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between">
        <dt>Subtotal</dt>
        <dd>{formatInr(subtotal)}</dd>
      </div>
      {shipping !== undefined ? (
        <div className="flex justify-between">
          <dt>Shipping</dt>
          <dd>{shipping === 0 ? "Free" : formatInr(shipping)}</dd>
        </div>
      ) : (
        <p className="text-xs text-zinc-500">
          Shipping is calculated at checkout from current store settings.
        </p>
      )}
      {total !== undefined ? (
        <div className="flex justify-between text-base font-semibold">
          <dt>Total</dt>
          <dd>{formatInr(total)}</dd>
        </div>
      ) : null}
    </dl>
  );
}
