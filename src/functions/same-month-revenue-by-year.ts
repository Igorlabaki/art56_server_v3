import { uniqueProposalYears } from "./proposal-years";
import { wallClockMonth, wallClockYear } from "./wall-clock-datetime";

export interface SameMonthRevenueEvent {
  startDate: Date;
  totalAmount: number | null;
}

export interface SameMonthRevenuePoint {
  year: number;
  revenue: number;
}

/** `null` quando o periodo e o ano inteiro: a conta do mesmo mes nao roda. */
export function sameMonthNumber(month: string | undefined): number | null {
  if (month === "all") return null;
  if (!month) return null;
  const parsed = Number(month);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 12) return null;
  return parsed;
}

export function revenueEventWhere(venueId: string) {
  return {
    venueId,
    type: "EVENT" as const,
    proposal: { is: { totalAmount: { gt: 0 } } },
  };
}

/** Anos wall-clock com algum evento de receita, em qualquer mes, do mais antigo ao mais recente. */
export function revenueYears(events: SameMonthRevenueEvent[]): number[] {
  return uniqueProposalYears(
    events
      .filter((event) => event.totalAmount != null && event.totalAmount > 0)
      .map((event) => event.startDate),
  );
}

export function sameMonthEventWhere(venueId: string, month: number, years: number[]) {
  return {
    venueId,
    type: "EVENT" as const,
    OR: years.map((year) => ({
      startDate: {
        gte: new Date(Date.UTC(year, month - 1, 1)),
        lte: new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)),
      },
    })),
  };
}

export function sameMonthRevenueByYear(input: {
  month: number;
  years: number[];
  events: SameMonthRevenueEvent[];
}): SameMonthRevenuePoint[] {
  return input.years.map((year) => {
    const revenue = input.events.reduce((total, event) => {
      if (wallClockYear(event.startDate) !== year) return total;
      if (wallClockMonth(event.startDate) !== input.month) return total;
      if (event.totalAmount == null) return total;
      return total + event.totalAmount;
    }, 0);
    return { year, revenue };
  });
}
