import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(value: number) {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

export function formatCriteriaValue(value: number, unit?: string, criterionId?: string) {
  const normalizedUnit = (unit ?? "").trim();
  const isCurrency = normalizedUnit.toLowerCase() === "rp" || criterionId === "rent";
  const formattedValue = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2
  }).format(value);

  if (isCurrency) return `Rp ${formattedValue}`;
  return normalizedUnit ? `${formattedValue} ${normalizedUnit}` : formattedValue;
}
