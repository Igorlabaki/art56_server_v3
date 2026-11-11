import { civilDayNumber, localDateParts, REPORT_TIME_ZONE } from "./local-date";

export const LEAD_TIME_BUCKETS = [
  { key: "0-7", minDays: 0, maxDays: 7 },
  { key: "8-30", minDays: 8, maxDays: 30 },
  { key: "31-90", minDays: 31, maxDays: 90 },
  { key: "90+", minDays: 91, maxDays: null },
] as const;

export type LeadTimeBucketKey = typeof LEAD_TIME_BUCKETS[number]["key"];

export interface LeadTimeRow {
  createdAt: Date;
  startDate: Date;
  approved: boolean | null;
}

export interface LeadTimeData<Filter extends string = string> {
  year: number;
  eventCategory: Filter | null;
  created: number;
  considered: number;
  excluded: number;
  approved: number;
  medianDays: number | null;
  buckets: {
    key: LeadTimeBucketKey;
    minDays: number;
    maxDays: number | null;
    total: number;
    approved: number;
    approvalRate: number | null;
  }[];
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

/**
 * Dias entre a data local de criacao (fuso do espaco) e o dia do evento (componentes UTC, wall-clock).
 * So entram as propostas criadas no ano local; evento antes da criacao fica em `excluded`.
 */
export function buildLeadTime<Filter extends string>(
  rows: LeadTimeRow[],
  year: number,
  eventCategory: Filter | null = null,
  timeZone: string = REPORT_TIME_ZONE,
): LeadTimeData<Filter> {
  const buckets = LEAD_TIME_BUCKETS.map((bucket) => ({ ...bucket, total: 0, approved: 0 }));
  const days: number[] = [];
  let created = 0;
  let excluded = 0;
  let approved = 0;

  for (const row of rows) {
    const createdParts = localDateParts(row.createdAt, timeZone);
    if (createdParts.year !== year) continue;
    created += 1;

    const event = row.startDate;
    const lead = civilDayNumber({
      year: event.getUTCFullYear(),
      month: event.getUTCMonth() + 1,
      day: event.getUTCDate(),
    }) - civilDayNumber(createdParts);

    if (lead < 0) {
      excluded += 1;
      continue;
    }

    days.push(lead);
    const bucket = buckets.find((item) => item.maxDays === null || lead <= item.maxDays)!;
    bucket.total += 1;
    if (row.approved) {
      bucket.approved += 1;
      approved += 1;
    }
  }

  return {
    year,
    eventCategory,
    created,
    considered: created - excluded,
    excluded,
    approved,
    medianDays: median(days),
    buckets: buckets.map((bucket) => ({
      key: bucket.key,
      minDays: bucket.minDays,
      maxDays: bucket.maxDays,
      total: bucket.total,
      approved: bucket.approved,
      approvalRate: bucket.total > 0 ? bucket.approved / bucket.total : null,
    })),
  };
}
