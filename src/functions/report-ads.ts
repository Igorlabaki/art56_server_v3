import { ExpenseType, TrafficSource } from "@prisma/client";
import { ADS_CHANNELS, AdsChannel, recurringAmounts } from "./expense-recurrence";
import { localDateParts, REPORT_TIME_ZONE } from "./local-date";

export interface AdsExpenseRow {
  amount: number;
  type: ExpenseType;
  recurring: boolean;
  paymentDate: Date | null;
  createdAt: Date;
  trafficSource: TrafficSource | null;
}

export interface AdsProposalRow {
  createdAt: Date;
  trafficSource: TrafficSource | null;
  approved: boolean | null;
  totalAmount: number | null;
}

export interface AdsReportTotals {
  spent: number;
  proposals: number;
  events: number;
  revenue: number;
  costPerProposal: number | null;
  costPerEvent: number | null;
  roas: number | null;
}

export interface AdsReportRow extends AdsReportTotals {
  channel: AdsChannel | null;
}

export interface AdsReportData {
  year: number;
  rows: AdsReportRow[];
  total: AdsReportTotals;
}

function adsChannel(source: TrafficSource | null): AdsChannel | null {
  return (ADS_CHANNELS as readonly string[]).includes(source ?? "") ? (source as AdsChannel) : null;
}

/**
 * Meses do ano em que a recorrente conta: do mes local de cadastro (ou janeiro, se cadastrada antes)
 * ate dezembro em ano passado ou o mes local de `now` no ano corrente.
 */
export function activeMonths(createdAt: Date, year: number, now: Date, timeZone: string = REPORT_TIME_ZONE): number {
  const created = localDateParts(createdAt, timeZone);
  const today = localDateParts(now, timeZone);
  if (created.year > year || year > today.year) return 0;
  const first = created.year === year ? created.month : 1;
  const last = year === today.year ? today.month : 12;
  return Math.max(0, last - first + 1);
}

function expenseSpentInYear(expense: AdsExpenseRow, year: number, now: Date, timeZone: string): number {
  if (expense.recurring) {
    return recurringAmounts(expense.type, expense.amount).monthly * activeMonths(expense.createdAt, year, now, timeZone);
  }
  const expenseYear = expense.paymentDate
    ? expense.paymentDate.getUTCFullYear()
    : localDateParts(expense.createdAt, timeZone).year;
  return expenseYear === year ? expense.amount : 0;
}

function withCosts(row: Pick<AdsReportTotals, "spent" | "proposals" | "events" | "revenue">): AdsReportTotals {
  const hasSpent = row.spent > 0;
  return {
    ...row,
    costPerProposal: hasSpent && row.proposals > 0 ? row.spent / row.proposals : null,
    costPerEvent: hasSpent && row.events > 0 ? row.spent / row.events : null,
    roas: hasSpent ? row.revenue / row.spent : null,
  };
}

/**
 * Investido em anuncios por canal no ano e o que voltou em orcamentos criados no ano local.
 * Gasto sem canal entra so no total e na linha "Sem canal", sem custos nem retorno.
 */
export function buildAdsReport(
  expenses: AdsExpenseRow[],
  proposals: AdsProposalRow[],
  year: number,
  now: Date = new Date(),
  timeZone: string = REPORT_TIME_ZONE,
): AdsReportData {
  const byChannel = new Map(
    ADS_CHANNELS.map((channel) => [channel, { spent: 0, proposals: 0, events: 0, revenue: 0 }]),
  );
  let unassignedSpent = 0;

  for (const expense of expenses) {
    const spent = expenseSpentInYear(expense, year, now, timeZone);
    if (spent === 0) continue;
    const channel = adsChannel(expense.trafficSource);
    if (channel) byChannel.get(channel)!.spent += spent;
    else unassignedSpent += spent;
  }

  for (const proposal of proposals) {
    const channel = adsChannel(proposal.trafficSource);
    if (!channel || localDateParts(proposal.createdAt, timeZone).year !== year) continue;
    const row = byChannel.get(channel)!;
    row.proposals += 1;
    if (proposal.approved) {
      row.events += 1;
      row.revenue += proposal.totalAmount ?? 0;
    }
  }

  const rows: AdsReportRow[] = ADS_CHANNELS.map((channel) => ({ channel, ...withCosts(byChannel.get(channel)!) }));
  if (unassignedSpent > 0) {
    rows.push({
      channel: null,
      spent: unassignedSpent,
      proposals: 0,
      events: 0,
      revenue: 0,
      costPerProposal: null,
      costPerEvent: null,
      roas: null,
    });
  }

  const sums = [...byChannel.values()].reduce(
    (total, row) => ({
      spent: total.spent + row.spent,
      proposals: total.proposals + row.proposals,
      events: total.events + row.events,
      revenue: total.revenue + row.revenue,
    }),
    { spent: unassignedSpent, proposals: 0, events: 0, revenue: 0 },
  );

  return { year, rows, total: withCosts(sums) };
}
