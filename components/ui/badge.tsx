import { cn } from "@/lib/utils";

export function Badge({ children, variant = "sea", className }: {
  children: React.ReactNode;
  variant?: "sea" | "coral" | "land" | "muted";
  className?: string;
}) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
      variant === "sea" && "bg-orange-100 text-[#a64700]",
      variant === "coral" && "bg-coral/15 text-[#b84400]",
      variant === "land" && "bg-land/35 text-[#765000]",
      variant === "muted" && "bg-ocean/5 text-ink/55",
      className
    )}>
      {children}
    </span>
  );
}
