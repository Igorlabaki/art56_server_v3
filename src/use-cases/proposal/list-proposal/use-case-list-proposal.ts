import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { proposalListRange, ProposalListRange } from "../../../functions/wall-clock-datetime";
import { ListProposalDbQuery, ProposalListDailyBucket, ProposalListRow, ProposalListStatus, ProposalRepositoryInterface, ProposalWindowDailyAmount } from "../../../repositories/interface/proposal-repository-interface";
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface";
import { ListProposalRequestQuerySchema } from "../../../zod/proposal/list-proposal-query-schema";

const PAGE_SIZE = 10;

function withStatus(row: ProposalListRow): ProposalListRow & { status: ProposalListStatus } {
  return {
    ...row,
    status: row.approved ? "FECHADO" : "ABERTO",
  };
}

function conversionRate(approved: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((approved / total) * 100);
}

type ProposalChange = {
  total: number | null;
  monthAmount: number | null;
  conversionRate: number | null;
};

const NO_YEARLY_BASE: ProposalChange = {
  total: null,
  monthAmount: null,
  conversionRate: null,
};

function changePercent(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function yearlyChange(
  current: { total: number; monthAmount: number; conversionRate: number },
  previous: { total: number; monthAmount: number; conversionRate: number },
): ProposalChange {
  return {
    total: changePercent(current.total, previous.total),
    monthAmount: changePercent(current.monthAmount, previous.monthAmount),
    conversionRate: changePercent(current.conversionRate, previous.conversionRate),
  };
}

function previousYearRange(input: {
  month?: number;
  year?: number;
  day?: number;
}): ProposalListRange | "invalid-day" | null {
  if (input.month === undefined) return null;
  const year = input.year ?? new Date().getUTCFullYear();
  return proposalListRange({
    month: input.month,
    year: year - 1,
    day: input.day,
  });
}

function utcDays(range: ProposalListRange): string[] {
  const days: string[] = [];
  for (let time = range.gte.getTime(); time < range.lt.getTime(); time += 86_400_000) {
    days.push(new Date(time).toISOString().slice(0, 10));
  }
  return days;
}

function buildSummary(
  range: ProposalListRange | null,
  buckets: ProposalListDailyBucket[],
  windowRows: ProposalWindowDailyAmount[],
) {
  const byDay = new Map(buckets.map((bucket) => [bucket.day, bucket]));
  const eventByDay = new Map(windowRows.map((row) => [row.day, row.amount]));
  const calendar = range
    ? utcDays(range)
    : [...new Set([...byDay.keys(), ...eventByDay.keys()])].sort();
  const daily = calendar.map((iso) => {
    const bucket = byDay.get(iso) ?? { day: iso, count: 0, amount: 0, approved: 0 };
    return {
      day: Number(iso.slice(8, 10)),
      count: bucket.count,
      amount: eventByDay.get(iso) ?? 0,
      conversionRate: conversionRate(bucket.approved, bucket.count),
    };
  });
  const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0);
  const approved = buckets.reduce((sum, bucket) => sum + bucket.approved, 0);
  const monthAmount = windowRows.reduce((sum, row) => sum + row.amount, 0);
  const amountMax = windowRows.reduce((max, row) => Math.max(max, row.maxAmount), 0);
  return {
    total,
    monthAmount,
    amountMax,
    conversionRate: conversionRate(approved, total),
    daily,
  };
}

function emptyList(page?: number, summary?: boolean, range?: ProposalListRange | null) {
  const proposalList: ReturnType<typeof withStatus>[] = [];
  const body = {
    success: true as const,
    message: "Lista de orcamentos com 0 items",
    data: {
      proposalList,
      ...(summary ? { summary: { ...buildSummary(range ?? null, [], []), change: NO_YEARLY_BASE } } : {}),
    },
    count: 0,
    type: "List",
  };
  if (page === undefined) return body;
  return {
    ...body,
    pagination: { page, pageSize: PAGE_SIZE, total: 0, totalPages: 0 },
  };
}

class ListProposalUseCase {
  constructor(private proposalRepository: ProposalRepositoryInterface, private venueRepository: VenueRepositoryInterface) { }

  async execute(params: ListProposalRequestQuerySchema) {
    const venue = await this.venueRepository.getById({ venueId: params.venueId });

    if (!venue) {
      throw new HttpResourceNotFoundError("Usuario");
    }

    const range = proposalListRange({
      month: params.month,
      year: params.year,
      day: params.day,
    });

    if (range === "invalid-day") {
      return emptyList(params.page, params.summary, null);
    }

    const query: ListProposalDbQuery = {
      venueId: params.venueId,
      completeClientName: params.completeClientName,
      email: params.email,
      approved: params.approved,
      minAmount: params.minAmount,
      range: range ?? undefined,
      sortBy: params.sortBy,
      sortDir: params.sortDir,
      ...(params.page !== undefined && {
        skip: (params.page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    };

    const summaryQuery: ListProposalDbQuery = {
      venueId: query.venueId,
      completeClientName: query.completeClientName,
      email: query.email,
      approved: query.approved,
      minAmount: query.minAmount,
      range: query.range,
      sortBy: query.sortBy,
      sortDir: query.sortDir,
    };
    const earlier = previousYearRange(params);
    const earlierRange = earlier !== "invalid-day" && earlier !== null ? earlier : undefined;
    const earlierSummaryQuery = earlierRange ? { ...summaryQuery, range: earlierRange } : null;
    const windowQuery = { venueId: query.venueId, range: query.range };
    const earlierWindowQuery = earlierRange ? { venueId: query.venueId, range: earlierRange } : null;
    const [{ items, total }, buckets, windowRows, earlierBuckets, earlierWindowRows] = await Promise.all([
      this.proposalRepository.list(query),
      params.summary ? this.proposalRepository.summarize(summaryQuery) : Promise.resolve(null),
      params.summary ? this.proposalRepository.summarizeWindow(windowQuery) : Promise.resolve(null),
      params.summary && earlierSummaryQuery ? this.proposalRepository.summarize(earlierSummaryQuery) : Promise.resolve(null),
      params.summary && earlierWindowQuery ? this.proposalRepository.summarizeWindow(earlierWindowQuery) : Promise.resolve(null),
    ]);
    const proposalList = items.map(withStatus);
    const currentSummary = buckets && windowRows ? buildSummary(range, buckets, windowRows) : null;
    const change = currentSummary && earlierRange && earlierBuckets && earlierWindowRows
      ? yearlyChange(currentSummary, buildSummary(earlierRange, earlierBuckets, earlierWindowRows))
      : NO_YEARLY_BASE;

    const body = {
      success: true as const,
      message: `Lista de orcamentos com ${proposalList.length} items`,
      data: {
        proposalList,
        ...(currentSummary ? { summary: { ...currentSummary, change } } : {}),
      },
      count: proposalList.length,
      type: "List",
    };

    if (params.page === undefined) return body;

    return {
      ...body,
      pagination: {
        page: params.page,
        pageSize: PAGE_SIZE,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / PAGE_SIZE),
      },
    };
  }
}

export { ListProposalUseCase };
