import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  const styles = {
    primary:
      "bg-riya text-white hover:bg-[#c20510] disabled:bg-zinc-300",
    secondary:
      "bg-cream text-ink border border-black/10 hover:bg-white",
    ghost: "bg-transparent text-ink hover:bg-black/5",
  }[variant];

  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold tracking-wide transition",
        styles,
        className,
      )}
      {...props}
    />
  );
}
