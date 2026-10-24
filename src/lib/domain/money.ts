import { ZA_LOCALE } from "./dates";

export function formatZAR(cents: number, options: { cents?: boolean } = {}): string {
  const showCents = options.cents ?? cents % 100 !== 0;
  return new Intl.NumberFormat(ZA_LOCALE, {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(cents / 100);
}

export function formatZARWhole(cents: number): string {
  return formatZAR(Math.round(cents / 100) * 100, { cents: false });
}

export function formatPct(value: number, digits = 0): string {
  return `${value.toFixed(digits).replace(".", ",")}%`;
}

export function randToCents(rand: number): number {
  return Math.round(rand * 100);
}

export function centsToRand(cents: number): number {
  return cents / 100;
}

export function parseRandInput(value: string): number | null {
  const cleaned = value.replace(/[Rr\s]/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  return randToCents(Number.parseFloat(cleaned));
}
