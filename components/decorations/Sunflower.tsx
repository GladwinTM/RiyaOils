import { cn } from "@/lib/utils";

type SunflowerProps = {
  className?: string;
  size?: number;
};

export function Sunflower({ className, size = 72 }: SunflowerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
      className={cn("drop-shadow-sm", className)}
    >
      <circle cx="40" cy="40" r="12" fill="#6B3A12" />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const x = 40 + Math.cos(angle) * 22;
        const y = 40 + Math.sin(angle) * 22;
        return (
          <ellipse
            key={i}
            cx={x}
            cy={y}
            rx="8"
            ry="14"
            fill="#F4C542"
            stroke="#E4A318"
            transform={`rotate(${i * 30} ${x} ${y})`}
          />
        );
      })}
      <circle cx="40" cy="40" r="9" fill="#4A250C" />
    </svg>
  );
}

export function FloatingSunflower({ className, size = 56 }: SunflowerProps) {
  return <Sunflower className={cn("float-soft", className)} size={size} />;
}

export function SunflowerBackground({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <FloatingSunflower className="absolute -left-4 top-8 opacity-70" size={90} />
      <Sunflower className="absolute -right-6 top-24 rotate-12 opacity-50" size={120} />
      <FloatingSunflower className="absolute bottom-6 right-10 opacity-60" size={64} />
    </div>
  );
}

export function FloralDivider() {
  return (
    <div className="flex items-center justify-center gap-3 py-6 text-sunflower" aria-hidden="true">
      <span className="h-px w-16 bg-sunflower/70" />
      <Sunflower size={28} />
      <span className="h-px w-16 bg-sunflower/70" />
    </div>
  );
}

export function HeroDecoration() {
  return <SunflowerBackground />;
}

export function ShopDecoration() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-40 overflow-hidden">
      <Sunflower className="absolute -left-8 top-2 opacity-40" size={100} />
      <Sunflower className="absolute -right-6 top-6 rotate-45 opacity-30" size={80} />
    </div>
  );
}
