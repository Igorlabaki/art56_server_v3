import { describe, expect, it } from "vitest";
import { monthlyAverageByYears, yearsProposalWhere } from "./monthly-average-by-years";

describe("monthlyAverageByYears", () => {
  it("divide cada mes pelos anos da lista, contando como zero o ano sem proposta no mes", () => {
    const points = monthlyAverageByYears({
      years: [2024, 2025, 2026],
      proposals: [
        { startDate: new Date("2025-11-10T12:00:00.000Z"), approved: true },
        { startDate: new Date("2025-11-11T12:00:00.000Z"), approved: false },
        { startDate: new Date("2026-11-12T12:00:00.000Z"), approved: false },
        { startDate: new Date("2026-11-13T12:00:00.000Z"), approved: null },
        { startDate: new Date("2026-11-14T12:00:00.000Z"), approved: true },
        { startDate: new Date("2026-03-01T12:00:00.000Z"), approved: false },
      ],
    });

    expect(points).toHaveLength(12);
    expect(points[10]).toEqual({ month: "nov.", proposals: 5 / 3, approved: 2 / 3, rate: 40 });
    expect(points[2]).toEqual({ month: "mar.", proposals: 1 / 3, approved: 0, rate: 0 });
    expect(points[6]).toEqual({ month: "jul.", proposals: 0, approved: 0, rate: 0 });
  });

  it("ignora proposta de ano fora da lista", () => {
    const points = monthlyAverageByYears({
      years: [2026],
      proposals: [
        { startDate: new Date("1996-07-01T12:00:00.000Z"), approved: true },
        { startDate: new Date("2026-07-01T12:00:00.000Z"), approved: false },
      ],
    });

    expect(points[6]).toEqual({ month: "jul.", proposals: 1, approved: 0, rate: 0 });
  });

  it("usa mes e ano wall-clock da data", () => {
    const points = monthlyAverageByYears({
      years: [2026],
      proposals: [{ startDate: new Date("2026-11-01T01:00:00.000Z"), approved: true }],
    });

    expect(points[10].proposals).toBe(1);
    expect(points[9].proposals).toBe(0);
  });

  it("nao conta ano repetido duas vezes", () => {
    const points = monthlyAverageByYears({
      years: [2026, 2026],
      proposals: [{ startDate: new Date("2026-01-05T12:00:00.000Z"), approved: false }],
    });

    expect(points[0].proposals).toBe(1);
  });

  it("devolve lista vazia sem anos com receita", () => {
    expect(monthlyAverageByYears({ years: [], proposals: [] })).toEqual([]);
  });
});

describe("yearsProposalWhere", () => {
  it("monta um intervalo por ano, preservando anos abaixo de 100", () => {
    const where = yearsProposalWhere("venue-1", [6, 2026]);

    expect(where.venueId).toBe("venue-1");
    expect(where.OR[0].startDate.gte.getUTCFullYear()).toBe(6);
    expect(where.OR[0].startDate.lt.getUTCFullYear()).toBe(7);
    expect(where.OR[1].startDate.gte.toISOString()).toBe("2026-01-01T00:00:00.000Z");
    expect(where.OR[1].startDate.lt.toISOString()).toBe("2027-01-01T00:00:00.000Z");
  });
});
