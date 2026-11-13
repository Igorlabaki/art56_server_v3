import { Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { handleErrors } from "../../../errors/error-handler";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { ensureAuthenticate } from "../../../middleware/ensureAuthenticate";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";
import { ListProposalDbQuery, ProposalListDailyBucket, ProposalListRow, ProposalRepositoryInterface, ProposalWindowDailyAmount, ProposalWindowQuery } from "../../../repositories/interface/proposal-repository-interface";
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface";
import { proposalRoutes } from "../../../router/proposal";
import { listProposalRequestQuerySchema } from "../../../zod/proposal/list-proposal-query-schema";
import { ListProposalUseCase } from "./use-case-list-proposal";

function row(index: number, approved = false): ProposalListRow {
  return {
    id: `p-${String(index).padStart(2, "0")}`,
    completeClientName: `Cliente ${index}`,
    email: null,
    startDate: new Date("2026-11-01T23:00:00.000Z"),
    endDate: new Date("2026-11-02T02:00:00.000Z"),
    totalAmount: 1000 + index,
    approved,
  };
}

function harness(options?: { venue?: boolean; total?: number }) {
  const calls: ListProposalDbQuery[] = [];
  const total = options?.total ?? 25;
  const proposalRepository = {
    list: vi.fn(async (query: ListProposalDbQuery) => {
      calls.push(query);
      const all = Array.from({ length: total }, (_, index) => row(index + 1, index % 2 === 0))
        .filter((item) => query.approved === undefined || item.approved === query.approved)
        .filter((item) => query.minAmount === undefined || item.totalAmount >= query.minAmount);
      const page = query.take === undefined ? all : all.slice(query.skip ?? 0, (query.skip ?? 0) + query.take);
      return { items: page, total: all.length };
    }),
  } as unknown as ProposalRepositoryInterface;
  const venueRepository = {
    getById: vi.fn(async ({ venueId }: { venueId: string }) => {
      if (options?.venue === false || venueId !== "venue-1") return null;
      return { id: "venue-1" };
    }),
  } as unknown as VenueRepositoryInterface;
  return { calls, useCase: new ListProposalUseCase(proposalRepository, venueRepository), proposalRepository };
}

const base = {
  venueId: "venue-1",
  sortBy: "startDate" as const,
  sortDir: "asc" as const,
  month: 11,
  year: 2026,
  summary: false,
};

describe("listar orcamentos", () => {
  it("pagina de 10 com total do filtro", async () => {
    const { useCase, calls } = harness();
    const first = await useCase.execute({ ...base, page: 1, completeClientName: "ana" });
    const third = await useCase.execute({ ...base, page: 3 });

    expect(first.data.proposalList).toHaveLength(10);
    expect(first.pagination).toEqual({ page: 1, pageSize: 10, total: 25, totalPages: 3 });
    expect(third.data.proposalList).toHaveLength(5);
    expect(third.pagination?.total).toBe(25);
    expect(calls[0]).toMatchObject({ skip: 0, take: 10, completeClientName: "ana" });
    expect(calls[0].minAmount).toBeUndefined();
    expect(calls[1]).toMatchObject({ skip: 20, take: 10 });
  });

  it("mes wall-clock inclui 23:00Z do dia 1 e exclui o mes seguinte", async () => {
    const { useCase, calls } = harness();
    await useCase.execute({ ...base, page: 1 });
    const range = calls[0].range!;
    const evening = new Date("2026-11-01T23:00:00.000Z");
    expect(evening >= range.gte && evening < range.lt).toBe(true);
    expect(new Date("2026-12-01T00:00:00.000Z") < range.lt).toBe(false);
  });

  it("dia devolve so aquele dia civil", async () => {
    const { useCase, calls } = harness();
    await useCase.execute({ ...base, day: 6, page: 1 });
    expect(calls[0].range).toEqual({
      gte: new Date("2026-11-06T00:00:00.000Z"),
      lt: new Date("2026-11-07T00:00:00.000Z"),
    });
  });

  it("dia 31 num mes de 30 devolve vazio e nao consulta o mes seguinte", async () => {
    const { useCase, proposalRepository } = harness();
    const response = await useCase.execute({ ...base, month: 4, day: 31, page: 1, summary: true });
    expect(proposalRepository.list).not.toHaveBeenCalled();
    expect(response.data.proposalList).toEqual([]);
    expect(response.data.summary).toMatchObject({
      monthAmount: 0,
      amountMax: 0,
      total: 0,
      change: { total: null, monthAmount: null, conversionRate: null },
    });
    expect(response.pagination).toEqual({ page: 1, pageSize: 10, total: 0, totalPages: 0 });
  });

  it("approved ausente devolve Aberto e Fechado; true so Fechado", async () => {
    const { useCase, calls } = harness({ total: 2 });
    const both = await useCase.execute({ ...base, page: 1 });
    const closed = await useCase.execute({ ...base, page: 1, approved: true });
    expect(calls[0].approved).toBeUndefined();
    expect(both.data.proposalList.map((item) => item.status)).toEqual(["FECHADO", "ABERTO"]);
    expect(calls[1].approved).toBe(true);
    expect(closed.data.proposalList.length).toBeGreaterThan(0);
    expect(closed.data.proposalList.every((item) => item.status === "FECHADO")).toBe(true);
  });

  it("minAmount corta o filtro inteiro, nao so a pagina", async () => {
    const { useCase, calls } = harness();
    const response = await useCase.execute({ ...base, page: 1, minAmount: 1020 });
    expect(calls[0].minAmount).toBe(1020);
    expect(calls[0].take).toBe(10);
    expect(response.pagination).toEqual({ page: 1, pageSize: 10, total: 6, totalPages: 1 });
    expect(response.data.proposalList).toHaveLength(6);
    expect(response.data.proposalList.every((item) => item.totalAmount >= 1020)).toBe(true);
  });

  it("ordena por valor e desempata por id", async () => {
    const { useCase, calls } = harness();
    await useCase.execute({ ...base, page: 1, sortBy: "totalAmount", sortDir: "desc" });
    expect(calls[0].sortBy).toBe("totalAmount");
    expect(calls[0].sortDir).toBe("desc");
  });

  it("sem pagina devolve a lista inteira e sem JWT responde 401", async () => {
    const { useCase } = harness({ total: 4 });
    const response = await useCase.execute(base);
    expect(response.data.proposalList).toHaveLength(4);
    expect(response).not.toHaveProperty("pagination");

    await expect(useCase.execute({ ...base, venueId: "ausente" })).rejects.toBeInstanceOf(HttpResourceNotFoundError);

    const missingVenue = harness({ venue: false });
    await expect(missingVenue.useCase.execute(base)).rejects.toBeInstanceOf(HttpResourceNotFoundError);
    expect(missingVenue.proposalRepository.list).not.toHaveBeenCalled();

    const layer = proposalRoutes.stack.find((item) => item.route?.path?.startsWith("/list") && item.route.methods.get);
    expect(layer?.route?.stack[0]?.handle).toBe(ensureAuthenticate);
    const status = vi.fn(() => ({ json: vi.fn() }));
    ensureAuthenticate({ headers: {} } as never, { status } as never, () => {
      throw new Error("nao deveria seguir");
    });
    expect(status).toHaveBeenCalledWith(401);
  });

  it("query aceita pagina, dia e ordenacao e recusa dia sem mes", () => {
    const parsed = listProposalRequestQuerySchema.parse({
      venueId: "venue-1",
      page: "2",
      day: "6",
      month: "11",
      year: "2026",
      sortBy: "status",
      sortDir: "desc",
      completeClientName: "  ana  ",
      pageSize: "50",
    });
    expect(parsed).toMatchObject({
      page: 2,
      day: 6,
      month: 11,
      year: 2026,
      sortBy: "status",
      sortDir: "desc",
      completeClientName: "ana",
    });
    expect(parsed).not.toHaveProperty("pageSize");
    expect(parsed.approved).toBeUndefined();
    expect(parsed.minAmount).toBeUndefined();
    expect(listProposalRequestQuerySchema.parse({ venueId: "venue-1", minAmount: "" }).minAmount).toBeUndefined();
    expect(listProposalRequestQuerySchema.parse({ venueId: "venue-1", minAmount: "10.5" }).minAmount).toBe(10.5);
    expect(() => listProposalRequestQuerySchema.parse({ venueId: "venue-1", day: "6" })).toThrow();
    expect(() => listProposalRequestQuerySchema.parse({ venueId: "venue-1", minAmount: "-1" })).toThrow();
    expect(() => listProposalRequestQuerySchema.parse({ venueId: "venue-1", minAmount: "abc" })).toThrow();
    expect(listProposalRequestQuerySchema.parse({ venueId: "venue-1", approved: "false" }).approved).toBe(false);
    expect(parsed.summary).toBe(false);
  });

  it("query aceita whatsapp aparado, vazio vira ausente e longo demais e recusado", () => {
    expect(listProposalRequestQuerySchema.parse({ venueId: "venue-1", whatsapp: "  (11) 9  " }).whatsapp).toBe("(11) 9");
    expect(listProposalRequestQuerySchema.parse({ venueId: "venue-1", whatsapp: "   " }).whatsapp).toBeUndefined();
    expect(listProposalRequestQuerySchema.parse({ venueId: "venue-1" }).whatsapp).toBeUndefined();
    expect(() => listProposalRequestQuerySchema.parse({ venueId: "venue-1", whatsapp: "9".repeat(21) })).toThrow();
  });
});

describe("filtro por whatsapp", () => {
  it("use case repassa whatsapp junto com o nome para a lista e os dois resumos", async () => {
    const listed: ListProposalDbQuery[] = [];
    const summarized: ListProposalDbQuery[] = [];
    const proposalRepository = {
      list: vi.fn(async (query: ListProposalDbQuery) => {
        listed.push(query);
        return { items: [], total: 0 };
      }),
      summarize: vi.fn(async (query: ListProposalDbQuery) => {
        summarized.push(query);
        return [];
      }),
      summarizeWindow: vi.fn(async () => []),
    } as unknown as ProposalRepositoryInterface;
    const venueRepository = {
      getById: vi.fn(async () => ({ id: "venue-1" })),
    } as unknown as VenueRepositoryInterface;
    const useCase = new ListProposalUseCase(proposalRepository, venueRepository);

    await useCase.execute({ ...base, page: 1, summary: true, completeClientName: "ana", whatsapp: "(11) 99999" });

    expect(listed[0]).toMatchObject({ completeClientName: "ana", whatsapp: "(11) 99999" });
    expect(summarized).toHaveLength(2);
    expect(summarized[0]).toMatchObject({ completeClientName: "ana", whatsapp: "(11) 99999" });
    expect(summarized[1]).toMatchObject({ completeClientName: "ana", whatsapp: "(11) 99999" });
  });

  it("repositorio procura o whatsapp com mascara ou so com os digitos, na lista e no resumo", async () => {
    const findManyArgs: Array<{ where: Record<string, unknown> }> = [];
    const rawQueries: Prisma.Sql[] = [];
    const prisma = {
      proposal: {
        count: vi.fn(async () => 0),
        findMany: vi.fn(async (args: { where: Record<string, unknown> }) => {
          findManyArgs.push(args);
          return [];
        }),
      },
      $queryRaw: vi.fn(async (sql: Prisma.Sql) => {
        rawQueries.push(sql);
        return [];
      }),
    };
    const repository = new PrismaProposalRepository(prisma as never);
    const query: ListProposalDbQuery = {
      venueId: "venue-1",
      completeClientName: "ana",
      whatsapp: "(11) 99999-",
      sortBy: "startDate",
      sortDir: "asc",
    };

    await repository.list({ ...query, skip: 0, take: 10 });
    await repository.summarize(query);
    await repository.list({ ...query, whatsapp: "9_%" });
    await repository.summarize({ ...query, whatsapp: "9_%" });
    await repository.list({ venueId: "venue-1", sortBy: "startDate", sortDir: "asc" });

    expect(findManyArgs[0].where).toMatchObject({
      venueId: "venue-1",
      completeClientName: { contains: "ana" },
      OR: [
        { whatsapp: { contains: "(11) 99999-" } },
        { whatsapp: { contains: "1199999" } },
      ],
    });
    expect(rawQueries[0].sql).toContain("completeClientName LIKE ?");
    expect(rawQueries[0].sql).toContain("(whatsapp LIKE ? OR whatsapp LIKE ?)");
    expect(rawQueries[0].values).toEqual(expect.arrayContaining(["%ana%", "%(11) 99999-%", "%1199999%"]));

    expect(findManyArgs[1].where.OR).toEqual([
      { whatsapp: { contains: "9_%" } },
      { whatsapp: { contains: "9" } },
    ]);
    expect(rawQueries[1].values).toEqual(expect.arrayContaining(["%9\\_\\%%", "%9%"]));

    expect(findManyArgs[2].where).not.toHaveProperty("OR");
  });

  it("repositorio nao repete o termo quando ele ja e so digitos", async () => {
    const findManyArgs: Array<{ where: Record<string, unknown> }> = [];
    const prisma = {
      proposal: {
        findMany: vi.fn(async (args: { where: Record<string, unknown> }) => {
          findManyArgs.push(args);
          return [];
        }),
      },
    };
    const repository = new PrismaProposalRepository(prisma as never);
    await repository.list({ venueId: "venue-1", whatsapp: "8888", sortBy: "startDate", sortDir: "asc" });
    expect(findManyArgs[0].where.OR).toEqual([{ whatsapp: { contains: "8888" } }]);
  });
});

describe("resumo da listagem", () => {
  function summaryHarness(
    buckets: ProposalListDailyBucket[],
    windowRows: ProposalWindowDailyAmount[] = [],
    previous?: { buckets: ProposalListDailyBucket[]; windowRows: ProposalWindowDailyAmount[] },
  ) {
    const listed: ListProposalDbQuery[] = [];
    const summarized: ListProposalDbQuery[] = [];
    const windowCalls: ProposalWindowQuery[] = [];
    const proposalRepository = {
      list: vi.fn(async (query: ListProposalDbQuery) => {
        listed.push(query);
        return { items: [row(1)], total: buckets.reduce((sum, bucket) => sum + bucket.count, 0) };
      }),
      summarize: vi.fn(async (query: ListProposalDbQuery) => {
        summarized.push(query);
        if (previous && summarized.length > 1) return previous.buckets;
        return buckets;
      }),
      summarizeWindow: vi.fn(async (query: ProposalWindowQuery) => {
        windowCalls.push(query);
        if (previous && windowCalls.length > 1) return previous.windowRows;
        return windowRows;
      }),
    } as unknown as ProposalRepositoryInterface;
    const venueRepository = {
      getById: vi.fn(async () => ({ id: "venue-1" })),
    } as unknown as VenueRepositoryInterface;
    return {
      listed,
      summarized,
      windowCalls,
      useCase: new ListProposalUseCase(proposalRepository, venueRepository),
    };
  }

  const november = [
    { day: "2026-11-01", count: 20, amount: 1000.5, approved: 2 },
    { day: "2026-11-15", count: 20, amount: 500, approved: 10 },
  ];

  it("total segue o filtro e o valor do mes soma so o que virou evento", async () => {
    const events = [
      { day: "2026-11-01", amount: 800, maxAmount: 9000 },
      { day: "2026-11-15", amount: 200, maxAmount: 4000 },
    ];
    const { useCase, listed, summarized, windowCalls } = summaryHarness(november, events);
    const response = await useCase.execute({
      ...base,
      page: 1,
      summary: true,
      completeClientName: "ana",
      approved: false,
      minAmount: 100,
    });

    expect(response.data.proposalList).toHaveLength(1);
    expect(response.data.summary?.total).toBe(40);
    expect(response.data.summary?.monthAmount).toBe(1000);
    expect(response.data.summary?.amountMax).toBe(9000);
    expect(response.data.summary?.conversionRate).toBe(30);
    expect(response.data.summary?.daily).toHaveLength(30);
    expect(response.data.summary?.daily[0]).toEqual({ day: 1, count: 20, amount: 800, conversionRate: 10 });
    expect(response.data.summary?.daily[1]).toEqual({ day: 2, count: 0, amount: 0, conversionRate: 0 });
    expect(listed[0].completeClientName).toBe("ana");
    expect(listed[0].minAmount).toBe(100);
    expect(listed[0].approved).toBe(false);
    expect(summarized[0].completeClientName).toBe("ana");
    expect(summarized[0].minAmount).toBe(100);
    expect(summarized[0].approved).toBe(false);
    expect(summarized[0].skip).toBeUndefined();
    expect(windowCalls[0]).toEqual({ venueId: "venue-1", range: summarized[0].range });
    expect(windowCalls[0]).not.toHaveProperty("completeClientName");
    expect(windowCalls[0]).not.toHaveProperty("approved");
    expect(windowCalls[0]).not.toHaveProperty("minAmount");
    expect(summarized).toHaveLength(2);
    expect(summarized[1].range).toEqual({
      gte: new Date("2025-11-01T00:00:00.000Z"),
      lt: new Date("2025-12-01T00:00:00.000Z"),
    });
    expect(summarized[1].completeClientName).toBe("ana");
    expect(summarized[1].approved).toBe(false);
    expect(summarized[1].minAmount).toBe(100);
    expect(windowCalls).toHaveLength(2);
    expect(windowCalls[1]).toEqual({ venueId: "venue-1", range: summarized[1].range });
    expect(windowCalls[1]).not.toHaveProperty("completeClientName");
    expect(windowCalls[1]).not.toHaveProperty("approved");
    expect(windowCalls[1]).not.toHaveProperty("minAmount");
    expect(response.data.summary?.change).toEqual({ total: 0, monthAmount: 0, conversionRate: 0 });
  });

  it("filtro vazio devolve conversao 0 e dia unico reduz a janela", async () => {
    const empty = await summaryHarness([]).useCase.execute({ ...base, page: 1, summary: true });
    expect(empty.data.summary).toEqual({
      total: 0,
      monthAmount: 0,
      amountMax: 0,
      conversionRate: 0,
      daily: expect.any(Array),
      change: { total: null, monthAmount: null, conversionRate: null },
    });
    expect(empty.data.summary?.daily).toHaveLength(30);
    expect(empty.data.summary?.daily.every((point) => point.conversionRate === 0)).toBe(true);

    const oneDayHarness = summaryHarness([
      { day: "2026-11-06", count: 3, amount: 90, approved: 1 },
    ], [
      { day: "2026-11-06", amount: 40, maxAmount: 40 },
    ]);
    const oneDay = await oneDayHarness.useCase.execute({ ...base, page: 1, summary: true, day: 6 });
    expect(oneDayHarness.summarized[1].range).toEqual({
      gte: new Date("2025-11-06T00:00:00.000Z"),
      lt: new Date("2025-11-07T00:00:00.000Z"),
    });
    expect(oneDay.data.summary?.daily).toEqual([
      { day: 6, count: 3, amount: 40, conversionRate: 33 },
    ]);
    expect(oneDay.data.summary?.monthAmount).toBe(40);
    expect(oneDay.data.summary?.amountMax).toBe(40);
    expect(oneDay.data.summary?.total).toBe(3);
  });

  it("summary sem page responde 400 e sem summary a chave nao vem", async () => {
    let statusCode = 0;
    try {
      listProposalRequestQuerySchema.parse({ venueId: "venue-1", summary: "true", month: "11" });
    } catch (error) {
      statusCode = handleErrors(error).statusCode;
    }
    expect(statusCode).toBe(400);

    statusCode = 0;
    try {
      listProposalRequestQuerySchema.parse({ venueId: "venue-1", minAmount: "-1" });
    } catch (error) {
      statusCode = handleErrors(error).statusCode;
    }
    expect(statusCode).toBe(400);

    const { useCase, summarized, windowCalls } = summaryHarness(november);
    const response = await useCase.execute({ ...base, page: 1, summary: false });
    expect(response.data).not.toHaveProperty("summary");
    expect(summarized).toHaveLength(0);
    expect(windowCalls).toHaveLength(0);
  });

  it("change compara a mesma janela do ano anterior", async () => {
    const { useCase, summarized } = summaryHarness(
      [{ day: "2026-11-01", count: 243, amount: 0, approved: 2 }],
      [{ day: "2026-11-01", amount: 12590, maxAmount: 12590 }],
      {
        buckets: [{ day: "2025-11-01", count: 200, amount: 0, approved: 4 }],
        windowRows: [{ day: "2025-11-01", amount: 14000, maxAmount: 14000 }],
      },
    );
    const response = await useCase.execute({ ...base, page: 1, summary: true, completeClientName: "ana", approved: false });
    expect(response.data.summary?.total).toBe(243);
    expect(response.data.summary?.monthAmount).toBe(12590);
    expect(response.data.summary?.conversionRate).toBe(1);
    expect(response.data.summary?.change).toEqual({ total: 22, monthAmount: -10, conversionRate: -50 });
    expect(summarized[0].completeClientName).toBe("ana");
    expect(summarized[1].completeClientName).toBe("ana");
    expect(summarized[1].approved).toBe(false);
    expect(summarized[1].range).toEqual({
      gte: new Date("2025-11-01T00:00:00.000Z"),
      lt: new Date("2025-12-01T00:00:00.000Z"),
    });
  });

  it("Math.round de -10,5 responde -10 e anterior 0 nao anula o outro campo", async () => {
    const half = await summaryHarness(
      [{ day: "2026-11-01", count: 179, amount: 0, approved: 0 }],
      [{ day: "2026-11-01", amount: 0, maxAmount: 0 }],
      {
        buckets: [{ day: "2025-11-01", count: 200, amount: 0, approved: 0 }],
        windowRows: [{ day: "2025-11-01", amount: 0, maxAmount: 0 }],
      },
    ).useCase.execute({ ...base, page: 1, summary: true });
    expect(half.data.summary?.change?.total).toBe(-10);
    expect(half.data.summary?.change?.monthAmount).toBeNull();

    const independent = await summaryHarness(
      [{ day: "2026-11-01", count: 0, amount: 0, approved: 0 }],
      [{ day: "2026-11-01", amount: 80, maxAmount: 80 }],
      {
        buckets: [{ day: "2025-11-01", count: 10, amount: 0, approved: 5 }],
        windowRows: [{ day: "2025-11-01", amount: 0, maxAmount: 0 }],
      },
    ).useCase.execute({ ...base, page: 1, summary: true });
    expect(independent.data.summary?.change).toEqual({ total: -100, monthAmount: null, conversionRate: -100 });
  });

  it("29 de fevereiro sem par no ano anterior nao consulta e responde null", async () => {
    const { useCase, summarized, windowCalls } = summaryHarness(
      [{ day: "2024-02-29", count: 4, amount: 10, approved: 1 }],
      [{ day: "2024-02-29", amount: 10, maxAmount: 10 }],
    );
    const response = await useCase.execute({ ...base, month: 2, year: 2024, day: 29, page: 1, summary: true });
    expect(summarized).toHaveLength(1);
    expect(windowCalls).toHaveLength(1);
    expect(summarized[0].range).toEqual({
      gte: new Date("2024-02-29T00:00:00.000Z"),
      lt: new Date("2024-03-01T00:00:00.000Z"),
    });
    expect(response.data.summary?.total).toBe(4);
    expect(response.data.summary?.change).toEqual({ total: null, monthAmount: null, conversionRate: null });
  });
});
