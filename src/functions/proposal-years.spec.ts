import { describe, expect, it } from "vitest";
import { uniqueProposalYears } from "./proposal-years";

describe("uniqueProposalYears", () => {
  it("devolve lista vazia quando nao ha orcamento", () => {
    expect(uniqueProposalYears([])).toEqual([]);
  });

  it("lista cada ano uma vez, em ordem crescente", () => {
    const dates = [
      new Date("2026-06-01T18:00:00.000Z"),
      new Date("2024-01-01T00:00:00.000Z"),
      new Date("2026-12-31T23:00:00.000Z"),
      new Date("2025-03-10T12:00:00.000Z"),
    ];

    expect(uniqueProposalYears(dates)).toEqual([2024, 2025, 2026]);
  });

  it("usa o ano wall-clock, sem puxar a virada para o ano anterior", () => {
    expect(uniqueProposalYears([new Date("2026-01-01T00:30:00.000Z")])).toEqual([
      2026,
    ]);
  });
});
