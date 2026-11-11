export function StockStatus({ stock }: { stock: number }) {
  if (stock <= 0) return <p className="text-sm text-riya">Out of stock</p>;
  if (stock < 8) return <p className="text-sm text-amber-700">Only {stock} left</p>;
  return <p className="text-sm text-zinc-600">{stock} in stock</p>;
}
