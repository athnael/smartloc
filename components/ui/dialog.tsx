"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({ className, children, title, description }: {
  className?: string;
  children: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ocean/55 backdrop-blur-sm data-[state=open]:animate-in" />
      <DialogPrimitive.Content className={cn(
        "fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-6 shadow-float focus:outline-none",
        className
      )}>
        <DialogPrimitive.Title className="font-serif text-2xl font-bold text-ocean">{title}</DialogPrimitive.Title>
        {description ? <DialogPrimitive.Description className="mt-1 text-sm text-ink/55">{description}</DialogPrimitive.Description> : null}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-2 text-ink/50 hover:bg-mist" aria-label="Tutup">
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
        <div className="mt-5">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
