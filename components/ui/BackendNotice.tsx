export function BackendNotice({ message }: { message?: string | null }) {
  if (!message) return null;

  return (
    <div
      role="status"
      className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
    >
      <p className="font-medium">Still waiting on the store</p>
      <p className="mt-1 text-amber-900/80">{message}</p>
      <p className="mt-2 text-amber-900/80">
        The page still loaded so you can keep browsing. Refresh in a moment if
        products look empty.
      </p>
    </div>
  );
}
