import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <div className={cn("inline-flex items-center gap-3", light ? "text-white" : "text-ocean")} aria-label="SMARTLOC">
      <span className={cn(
        "grid h-10 w-10 place-items-center rounded-[14px]",
        light ? "bg-land text-ink" : "bg-gradient-to-br from-land to-coral text-ink"
      )}>
        <MapPin className="h-5 w-5" strokeWidth={2.5} />
      </span>
      {!compact ? (
        <span>
          <span className="block text-base font-black tracking-[-.04em]">SMARTLOC</span>
        </span>
      ) : null}
    </div>
  );
}
