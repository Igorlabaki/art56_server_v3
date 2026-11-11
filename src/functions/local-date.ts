export const REPORT_TIME_ZONE = "America/Sao_Paulo";

const DAY_MS = 24 * 60 * 60 * 1000;

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    formatters.set(timeZone, formatter);
  }
  return formatter;
}

/** Data civil de um instante real (ex.: `createdAt`) no fuso informado. */
export function localDateParts(date: Date, timeZone: string = REPORT_TIME_ZONE): { year: number; month: number; day: number } {
  const parts = formatterFor(timeZone).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  return { year: value("year"), month: value("month"), day: value("day") };
}

/** Numero do dia civil contado desde 1970-01-01; `setUTCFullYear` preserva anos de 0 a 99. */
export function civilDayNumber(parts: { year: number; month: number; day: number }): number {
  const date = new Date(0);
  date.setUTCFullYear(parts.year, parts.month - 1, parts.day);
  return Math.floor(date.getTime() / DAY_MS);
}
