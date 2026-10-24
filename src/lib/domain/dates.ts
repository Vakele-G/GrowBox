export const JOHANNESBURG_TIME_ZONE = "Africa/Johannesburg";
export const ZA_LOCALE = "en-ZA";

const johannesburgDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: JOHANNESBURG_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function toDateString(date: Date): string {
  const parts = johannesburgDate.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

export function today(now: Date = new Date()): string {
  return toDateString(now);
}

export function parseDateString(value: string): Date {
  return new Date(`${value}T00:00:00+02:00`);
}

export function addDays(value: string, days: number): string {
  const date = parseDateString(value);
  date.setUTCDate(date.getUTCDate() + days);
  return toDateString(date);
}

export function diffDays(from: string, to: string): number {
  const start = parseDateString(from).getTime();
  const end = parseDateString(to).getTime();
  return Math.round((end - start) / 86_400_000);
}

export function lastNDates(count: number, end: string = today()): string[] {
  return Array.from({ length: count }, (_, index) => addDays(end, index - count + 1));
}

export function formatDateZA(value: string): string {
  return new Intl.DateTimeFormat(ZA_LOCALE, {
    timeZone: JOHANNESBURG_TIME_ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parseDateString(value));
}

export function formatWeekdayZA(value: string): string {
  return new Intl.DateTimeFormat(ZA_LOCALE, {
    timeZone: JOHANNESBURG_TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(parseDateString(value));
}
