import { DateEventType } from "@prisma/client";
import { reportYearRange } from "./report-year-range";
import { proposalListRange, wallClockDateIsoFromDate } from "./wall-clock-datetime";

export const BAND_HOURS = 2;

const BANDS_PER_DAY = 24 / BAND_HOURS;
const BAND_MS = BAND_HOURS * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

export type OccupancyGroup = "events" | "visits" | "blocks";
type OccupancyKey = OccupancyGroup | "total";

/** `PROPOSAL` e reserva provisoria e fica fora do mapa. */
export const OCCUPANCY_GROUPS: Record<OccupancyGroup, readonly DateEventType[]> = {
  events: ["EVENT", "OVERNIGHT", "PRODUCTION", "BARTER"],
  visits: ["VISIT"],
  blocks: ["OTHER"],
};

export const OCCUPANCY_TYPES: DateEventType[] = Object.values(OCCUPANCY_GROUPS).flat();

const GROUPS = Object.keys(OCCUPANCY_GROUPS) as OccupancyGroup[];
const KEYS: OccupancyKey[] = [...GROUPS, "total"];

export interface OccupancyRow {
  type: string;
  startDate: Date;
  endDate: Date;
}

export interface OccupancyPeriod {
  kind: "year" | "month";
  year: number;
  month: number | null;
  gte: Date;
  lt: Date;
}

export interface OccupancyCell {
  weekday: number;
  band: number;
  events: number;
  visits: number;
  blocks: number;
  total: number;
}

export interface OccupancyData {
  period: { kind: "year" | "month"; year: number; month: number | null };
  bandHours: typeof BAND_HOURS;
  cells: OccupancyCell[];
  totals: Record<OccupancyKey, number>;
  daysWithRecords: Record<OccupancyKey, number>;
  occupancyRate: null;
  availability: { defined: false; openingHour: string | null; closingHour: string | null };
  discarded: number;
}

type Interval = [number, number];

/** Ano inteiro ou mes, sempre em componentes UTC (wall-clock da agenda). */
export function occupancyPeriod(year: number, month?: number): OccupancyPeriod {
  if (month === undefined) {
    return { kind: "year", year, month: null, ...reportYearRange(year) };
  }
  const range = proposalListRange({ year, month });
  if (!range || range === "invalid-day") {
    throw new Error(`Mes invalido: ${month}`);
  }
  return { kind: "month", year, month, ...range };
}

function groupOf(type: string): OccupancyGroup | null {
  return GROUPS.find((group) => (OCCUPANCY_GROUPS[group] as readonly string[]).includes(type)) ?? null;
}

function mergeIntervals(intervals: Interval[]): Interval[] {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const merged: Interval[] = [];
  for (const [start, end] of sorted) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) {
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
  }
  return merged;
}

function emptyRecord(): Record<OccupancyKey, number> {
  return { events: 0, visits: 0, blocks: 0, total: 0 };
}

/**
 * Minutos ocupados por dia da semana e faixa de 2 h. Cada grupo e a uniao dos seus intervalos;
 * `total` e a uniao dos tres grupos, entao sobreposicao entre grupos nao conta duas vezes.
 */
export function buildOccupancy(
  rows: OccupancyRow[],
  period: OccupancyPeriod,
  hours: { openingHour?: string | null; closingHour?: string | null } = {},
): OccupancyData {
  const periodStart = period.gte.getTime();
  const periodEnd = period.lt.getTime();
  const byGroup: Record<OccupancyGroup, Interval[]> = { events: [], visits: [], blocks: [] };
  let discarded = 0;

  for (const row of rows) {
    const group = groupOf(row.type);
    if (!group) continue;
    const start = row.startDate.getTime();
    const end = row.endDate.getTime();
    if (!(end > start)) {
      discarded += 1;
      continue;
    }
    const clippedStart = Math.max(start, periodStart);
    const clippedEnd = Math.min(end, periodEnd);
    if (clippedEnd > clippedStart) byGroup[group].push([clippedStart, clippedEnd]);
  }

  const merged: Record<OccupancyKey, Interval[]> = {
    events: mergeIntervals(byGroup.events),
    visits: mergeIntervals(byGroup.visits),
    blocks: mergeIntervals(byGroup.blocks),
    total: mergeIntervals([...byGroup.events, ...byGroup.visits, ...byGroup.blocks]),
  };

  const cells: OccupancyCell[] = [];
  for (let weekday = 0; weekday < 7; weekday += 1) {
    for (let band = 0; band < BANDS_PER_DAY; band += 1) {
      cells.push({ weekday, band, ...emptyRecord() });
    }
  }

  const totals = emptyRecord();
  const daysWithRecords = emptyRecord();

  for (const key of KEYS) {
    const days = new Set<string>();
    for (const [start, end] of merged[key]) {
      let cursor = start;
      while (cursor < end) {
        const segmentEnd = Math.min(end, Math.floor(cursor / BAND_MS) * BAND_MS + BAND_MS);
        const minutes = (segmentEnd - cursor) / MINUTE_MS;
        const at = new Date(cursor);
        cells[at.getUTCDay() * BANDS_PER_DAY + Math.floor(at.getUTCHours() / BAND_HOURS)][key] += minutes;
        totals[key] += minutes;
        days.add(wallClockDateIsoFromDate(at));
        cursor = segmentEnd;
      }
    }
    daysWithRecords[key] = days.size;
  }

  return {
    period: { kind: period.kind, year: period.year, month: period.month },
    bandHours: BAND_HOURS,
    cells,
    totals,
    daysWithRecords,
    occupancyRate: null,
    availability: {
      defined: false,
      openingHour: hours.openingHour ?? null,
      closingHour: hours.closingHour ?? null,
    },
    discarded,
  };
}
