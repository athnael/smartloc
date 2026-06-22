import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border border-orange-200 bg-white px-3 text-sm text-ink shadow-sm placeholder:text-ink/35 focus:border-coral focus:ring-2 focus:ring-coral/15",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
