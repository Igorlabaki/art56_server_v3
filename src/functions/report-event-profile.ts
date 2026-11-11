import { EventCategory, eventCategoryCounts } from "./event-category";

export const GUEST_BUCKETS = [
  { key: "0-50", min: 0, max: 50 },
  { key: "51-100", min: 51, max: 100 },
  { key: "101-150", min: 101, max: 150 },
  { key: "151+", min: 151, max: null },
] as const;

export type GuestBucketKey = typeof GUEST_BUCKETS[number]["key"];

export interface EventProfileRow {
  guestNumber: number | null;
  eventCategory: string | null;
}

export interface EventProfileData {
  year: number;
  events: number;
  guestBuckets: { key: GuestBucketKey; min: number; max: number | null; count: number }[];
  categories: { eventCategory: EventCategory | null; count: number }[];
  capacity: {
    maxGuest: number;
    atLeast80: number;
    above100: number;
    atLeast80Rate: number | null;
    above100Rate: number | null;
  } | null;
}

export function isValidCapacity(maxGuest: number | null | undefined): maxGuest is number {
  return typeof maxGuest === "number" && Number.isInteger(maxGuest) && maxGuest > 0;
}

/** Porte (faixas de convidados), categorias e uso da capacidade dos eventos aprovados do ano. */
export function buildEventProfile(
  rows: EventProfileRow[],
  year: number,
  maxGuest: number | null | undefined,
): EventProfileData {
  const guestBuckets = GUEST_BUCKETS.map((bucket) => ({ ...bucket, count: 0 }));
  const capacityValid = isValidCapacity(maxGuest);
  let atLeast80 = 0;
  let above100 = 0;

  for (const row of rows) {
    const guest = Math.max(row.guestNumber ?? 0, 0);
    guestBuckets.find((bucket) => bucket.max === null || guest <= bucket.max)!.count += 1;
    if (capacityValid) {
      if (guest * 5 >= maxGuest * 4) atLeast80 += 1;
      if (guest > maxGuest) above100 += 1;
    }
  }

  const events = rows.length;
  const categories = eventCategoryCounts(rows.map((row) => ({ eventCategory: row.eventCategory, count: 1 })))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .map((item) => ({ eventCategory: item.key, count: item.count }));

  return {
    year,
    events,
    guestBuckets: guestBuckets.map(({ key, min, max, count }) => ({ key, min, max, count })),
    categories,
    capacity: capacityValid
      ? {
          maxGuest,
          atLeast80,
          above100,
          atLeast80Rate: events > 0 ? atLeast80 / events : null,
          above100Rate: events > 0 ? above100 / events : null,
        }
      : null,
  };
}
