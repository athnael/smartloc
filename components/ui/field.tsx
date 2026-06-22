import * as React from "react";
import { cn } from "@/lib/utils";

export function Field({ label, error, hint, children, className }: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("grid gap-2 text-sm font-semibold text-ocean", className)}>
      <span>{label}</span>
      {children}
      {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
      {hint && !error ? <span className="text-xs font-normal text-ink/50">{hint}</span> : null}
    </label>
  );
}
