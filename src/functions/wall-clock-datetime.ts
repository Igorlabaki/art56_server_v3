/**
 * Componentes UTC do Date sao o relogio de parede do evento.
 * Ex.: 2026-07-05T11:00:00.000Z significa 05/07/2026 as 11:00.
 */

const WEEKDAYS_EN = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

function pad2(value: number | string): string {
  return String(value).padStart(2, "0");
}

export function parseWallClockDateParts(
  date: string,
  divisor = "/",
): { year: string; month: string; day: string } {
  const trimmed = date.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split("-");
    return { year, month, day };
  }

  const parts = trimmed.split(divisor);
  if (
    parts.length === 3 &&
    /^\d{2}$/.test(parts[0]) &&
    /^\d{2}$/.test(parts[1]) &&
    /^\d{4}$/.test(parts[2])
  ) {
    const [day, month, year] = parts;
    return { year, month, day };
  }

  throw new Error(`Formato de data inválido: ${date}`);
}

export function formatWallClockTime(date: Date): string {
  return `${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}`;
}

export function formatWallClockDateBr(date: Date): string {
  return `${pad2(date.getUTCDate())}/${pad2(date.getUTCMonth() + 1)}/${date.getUTCFullYear()}`;
}

export function wallClockDateIsoFromDate(date: Date): string {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

export function formatWallClockGoogleDateTime(date: Date): string {
  return `${wallClockDateIsoFromDate(date)}T${formatWallClockTime(date)}:${pad2(date.getUTCSeconds())}`;
}

export function wallClockYear(date: Date): number {
  return date.getUTCFullYear();
}

export function wallClockMonth(date: Date): number {
  return date.getUTCMonth() + 1;
}

export function wallClockWeekdayEn(date: Date): string {
  return WEEKDAYS_EN[date.getUTCDay()];
}

export function isWallClockDayInRange(event: Date, startDay: string, endDay: string): boolean {
  const iso = wallClockDateIsoFromDate(event);
  const year = event.getUTCFullYear();
  const toIso = (ddmm: string, y: number) => {
    const [day, month] = ddmm.split("/");
    if (!day || !month) return "";
    return `${y}-${pad2(month)}-${pad2(day)}`;
  };
  const startIso = toIso(startDay, year);
  const endIso = toIso(endDay, year);
  if (!startIso || !endIso) return false;
  if (endIso < startIso) {
    return iso >= startIso || iso <= endIso;
  }
  return iso >= startIso && iso <= endIso;
}

export type ProposalListRange = { gte: Date; lt: Date };

function isUtcCivilDay(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** Intervalo [gte, lt) do mes ou do dia, em componentes UTC. `null` quando nao ha mes. */
export function proposalListRange(input: {
  month?: number;
  year?: number;
  day?: number;
  now?: Date;
}): ProposalListRange | "invalid-day" | null {
  if (input.month === undefined) return null;

  const year = input.year ?? (input.now ?? new Date()).getUTCFullYear();
  const month = input.month;

  if (input.day === undefined) {
    return {
      gte: new Date(Date.UTC(year, month - 1, 1)),
      lt: new Date(Date.UTC(year, month, 1)),
    };
  }

  if (!isUtcCivilDay(year, month, input.day)) return "invalid-day";

  return {
    gte: new Date(Date.UTC(year, month - 1, input.day)),
    lt: new Date(Date.UTC(year, month - 1, input.day + 1)),
  };
}

export function parseDateOnlyWallClock(date: string): Date {
  const trimmed = date.trim();
  if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
    const day = trimmed.slice(0, 10);
    return parseDateOnlyWallClock(day);
  }

  const { year, month, day } = parseWallClockDateParts(trimmed);
  const isoDay = `${year}-${pad2(month)}-${pad2(day)}`;
  const parsed = new Date(`${isoDay}T12:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || wallClockDateIsoFromDate(parsed) !== isoDay) {
    throw new Error(`Formato de data inválido: ${date}`);
  }
  return parsed;
}
