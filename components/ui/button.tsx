import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-coral text-white shadow-[0_8px_22px_rgba(255,107,0,.22)] hover:bg-[#e85d00]",
        secondary: "bg-land text-ink hover:bg-[#f4c600]",
        outline: "border border-orange-200 bg-white text-ocean hover:border-orange-300 hover:bg-mist",
        ghost: "text-ocean hover:bg-land/25",
        coral: "bg-coral text-white shadow-[0_8px_22px_rgba(255,107,0,.22)] hover:bg-[#e85d00]",
        danger: "bg-red-50 text-red-700 hover:bg-red-100"
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-13 px-7 text-base",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: { variant: "default", size: "default" }
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";

export { buttonVariants };
