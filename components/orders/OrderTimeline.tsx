const STEPS = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
] as const;

export function OrderTimeline({ status }: { status: string }) {
  if (status === "CANCELLED") {
    return (
      <ol className="text-sm">
        <li>Order placed</li>
        <li className="mt-2 text-riya">Cancelled</li>
      </ol>
    );
  }

  const current = STEPS.indexOf(status as (typeof STEPS)[number]);

  return (
    <ol className="space-y-2 text-sm">
      {STEPS.map((step, index) => (
        <li key={step} className="flex items-center gap-2">
          <span
            className={`grid h-5 w-5 place-items-center rounded-full text-[10px] ${
              index <= current ? "bg-riya text-white" : "bg-zinc-200"
            }`}
          >
            {index <= current ? "✓" : ""}
          </span>
          {step.charAt(0) + step.slice(1).toLowerCase()}
        </li>
      ))}
    </ol>
  );
}

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold tracking-wide">
      {status}
    </span>
  );
}
