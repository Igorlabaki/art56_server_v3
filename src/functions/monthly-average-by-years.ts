import { wallClockMonth, wallClockYear } from "./wall-clock-datetime";

export const ANALYSIS_MONTHS = [
  "jan.", "fev.", "mar.", "abr.", "mai.", "jun.",
  "jul.", "ago.", "set.", "out.", "nov.", "dez.",
] as const;

export interface MonthlyAverageProposal {
  startDate: Date;
  approved: boolean | null;
}

export interface MonthlyAveragePoint {
  month: string;
  proposals: number;
  approved: number;
  rate: number;
}

/** `Date.UTC` joga anos de 0 a 99 para 1900; `setUTCFullYear` preserva o ano digitado. */
function yearStart(year: number): Date {
  const date = new Date(0);
  date.setUTCFullYear(year, 0, 1);
  return date;
}

export function yearsProposalWhere(venueId: string, years: number[]) {
  return {
    venueId,
    OR: years.map((year) => ({
      startDate: { gte: yearStart(year), lt: yearStart(year + 1) },
    })),
  };
}

/**
 * Media de cada mes nos anos informados: ano sem proposta no mes conta como zero.
 * A taxa e agregada: aprovados somados / propostas somadas no mes.
 */
export function monthlyAverageByYears(input: {
  years: number[];
  proposals: MonthlyAverageProposal[];
}): MonthlyAveragePoint[] {
  const years = new Set(input.years);
  if (years.size === 0) return [];

  const proposals = ANALYSIS_MONTHS.map(() => 0);
  const approved = ANALYSIS_MONTHS.map(() => 0);
  for (const proposal of input.proposals) {
    if (!years.has(wallClockYear(proposal.startDate))) continue;
    const index = wallClockMonth(proposal.startDate) - 1;
    proposals[index] += 1;
    if (proposal.approved) approved[index] += 1;
  }

  return ANALYSIS_MONTHS.map((month, index) => ({
    month,
    proposals: proposals[index] / years.size,
    approved: approved[index] / years.size,
    rate: proposals[index] > 0 ? (approved[index] / proposals[index]) * 100 : 0,
  }));
}
