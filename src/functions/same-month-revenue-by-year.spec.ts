import { describe, expect, it } from "vitest";
import {
  sameMonthEventWhere,
  sameMonthNumber,
  sameMonthRevenueByYear,
} from "./same-month-revenue-by-year";

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
