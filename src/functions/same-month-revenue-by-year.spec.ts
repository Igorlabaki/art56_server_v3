import { describe, expect, it } from "vitest";
import {
  revenueEventWhere,
  revenueYears,
  sameMonthEventWhere,
  sameMonthNumber,
  sameMonthRevenueByYear,
} from "./same-month-revenue-by-year";

describe("revenueYears", () => {
  it("lista so os anos com receita, uma vez cada, em ordem crescente", () => {
    const years = revenueYears([
      { startDate: new Date("2026-03-10T12:00:00.000Z"), totalAmount: 500 },
      { startDate: new Date("2025-08-01T12:00:00.000Z"), totalAmount: 300 },
      { startDate: new Date("2026-09-10T12:00:00.000Z"), totalAmount: 100 },
      { startDate: new Date("1996-07-01T12:00:00.000Z"), totalAmount: 0 },
      { startDate: new Date("2030-07-01T12:00:00.000Z"), totalAmount: null },
    ]);

    expect(years).toEqual([2025, 2026]);
  });

  it("usa o ano wall-clock da data do evento", () => {
    expect(
      revenueYears([{ startDate: new Date("2026-01-01T00:30:00.000Z"), totalAmount: 10 }]),
    ).toEqual([2026]);
  });

  it("devolve lista vazia quando o espaco nao tem receita", () => {
    expect(revenueYears([])).toEqual([]);
  });

  it("mantem o ano com receita em outro mes e zera o mes escolhido", () => {
    const events = [
      { startDate: new Date("2025-11-15T12:00:00.000Z"), totalAmount: 200 },
      { startDate: new Date("2026-03-10T12:00:00.000Z"), totalAmount: 400 },
    ];

    expect(
      sameMonthRevenueByYear({ month: 7, years: revenueYears(events), events }),
    ).toEqual([
      { year: 2025, revenue: 0 },
      { year: 2026, revenue: 0 },
    ]);
  });

  it("consulta so eventos do tipo EVENT com proposta de valor positivo", () => {
    expect(revenueEventWhere("venue-1")).toEqual({
      venueId: "venue-1",
      type: "EVENT",
      proposal: { is: { totalAmount: { gt: 0 } } },
    });
  });
});

describe("sameMonthRevenueByYear", () => {
  it("soma o mesmo mes em cada ano e deixa zerado o ano sem evento", () => {
    const points = sameMonthRevenueByYear({
      month: 11,
      years: [2024, 2025, 2026],
      events: [
        { startDate: new Date("2025-11-15T12:00:00.000Z"), totalAmount: 200 },
        { startDate: new Date("2026-11-20T18:00:00.000Z"), totalAmount: 80 },
        { startDate: new Date("2026-11-21T18:00:00.000Z"), totalAmount: 20 },
        { startDate: new Date("2026-10-31T23:00:00.000Z"), totalAmount: 50 },
        { startDate: new Date("2023-11-02T12:00:00.000Z"), totalAmount: 999 },
        { startDate: new Date("2026-11-22T12:00:00.000Z"), totalAmount: null },
      ],
    });

    expect(points).toEqual([
      { year: 2024, revenue: 0 },
      { year: 2025, revenue: 200 },
      { year: 2026, revenue: 100 },
    ]);
  });

  it("conta 2026-11-01T01:00:00.000Z como novembro", () => {
    const points = sameMonthRevenueByYear({
      month: 11,
      years: [2026],
      events: [{ startDate: new Date("2026-11-01T01:00:00.000Z"), totalAmount: 15 }],
    });

    expect(points).toEqual([{ year: 2026, revenue: 15 }]);
  });

  it("devolve lista vazia quando nao ha anos", () => {
    expect(sameMonthRevenueByYear({ month: 11, years: [], events: [] })).toEqual([]);
  });

  it("nao pede a conta quando o periodo e o ano inteiro", () => {
    expect(sameMonthNumber("all")).toBeNull();
    expect(sameMonthNumber("11")).toBe(11);
  });

  it("restringe a consulta a eventos do tipo EVENT", () => {
    expect(sameMonthEventWhere("venue-1", 11, [2026]).type).toBe("EVENT");
  });
});
