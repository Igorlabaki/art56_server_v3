import { afterEach, describe, expect, it, vi } from "vitest";
import { PrismaClient } from "@prisma/client";
import { PrismaExpenseRepository } from "./expense-in-prisma-repository";

function repositoryWithFakePrisma() {
  const findMany = vi.fn().mockResolvedValue([]);
  const prisma = { expense: { findMany } } as unknown as PrismaClient;
  return { repository: new PrismaExpenseRepository(prisma), findMany };
}

describe("analyze das despesas", () => {
  const originalTimeZone = process.env.TZ;

  afterEach(() => {
    process.env.TZ = originalTimeZone;
  });

  it("recorta as esporadicas de 1/1 a 31/12 em UTC e mantem todas as recorrentes", async () => {
    const { repository, findMany } = repositoryWithFakePrisma();

    await repository.analyze({ venueId: "venue-1", year: "2026" });

    const { where } = findMany.mock.calls[0][0];
    expect(where.venueId).toBe("venue-1");
    expect(where.OR[0]).toEqual({ recurring: true });
    expect(where.OR[1].recurring).toBe(false);
    expect(where.OR[1].paymentDate.gte.toISOString()).toBe("2026-01-01T00:00:00.000Z");
    expect(where.OR[1].paymentDate.lt.toISOString()).toBe("2027-01-01T00:00:00.000Z");
  });

  it("com o servidor em Sao Paulo, pagamento de 1/1 entra e janeiro do ano seguinte fica fora", async () => {
    process.env.TZ = "America/Sao_Paulo";
    const { repository, findMany } = repositoryWithFakePrisma();

    await repository.analyze({ venueId: "venue-1", year: "2026" });

    const { gte, lt } = findMany.mock.calls[0][0].where.OR[1].paymentDate;
    const firstDay = new Date("2026-01-01T00:00:00.000Z");
    const nextJanuary = new Date("2027-01-15T00:00:00.000Z");
    expect(firstDay >= gte && firstDay < lt).toBe(true);
    expect(nextJanuary >= gte && nextJanuary < lt).toBe(false);
  });
});
