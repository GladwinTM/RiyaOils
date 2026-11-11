export function ProductImage({
  src,
  alt,
  className = "",
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div className={`grid place-items-center bg-cream text-sm text-zinc-500 ${className}`}>
        No image
      </div>
    );
  }

  return (
    // External product URLs come from the API / storage, not this repo.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={`object-cover ${className}`} />
  );
}
