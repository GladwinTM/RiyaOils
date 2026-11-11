export function ProductSkeleton() {
  return <div className="aspect-square animate-pulse rounded-2xl bg-white" />;
}

export function ShopSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}

export function OrderSkeleton() {
  return <div className="h-64 animate-pulse rounded-2xl bg-white" />;
}

export function ContactSkeleton() {
  return <div className="h-48 animate-pulse rounded-2xl bg-white" />;
}
