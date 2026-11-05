import { wallClockYear } from "./wall-clock-datetime";

/** Anos wall-clock de startDate, sem repetir, do mais antigo ao mais recente. */
export function uniqueProposalYears(startDates: Date[]): number[] {
  const years = new Set<number>();
  for (const startDate of startDates) {
    years.add(wallClockYear(startDate));
  }
  return [...years].sort((a, b) => a - b);
}
