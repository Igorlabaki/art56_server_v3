import { yearStart } from "./monthly-average-by-years";

/** Ano inteiro em wall-clock: de 1/1 do ano ate antes de 1/1 do ano seguinte. */
export function reportYearRange(year?: number | null): { gte: Date; lt: Date } {
  const value = year || new Date().getFullYear();
  return { gte: yearStart(value), lt: yearStart(value + 1) };
}
