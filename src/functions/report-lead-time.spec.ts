import { describe, expect, it } from "vitest";
import { buildLeadTime, median } from "./report-lead-time";

/** Criacao ao meio-dia de Sao Paulo; evento em wall-clock (componentes UTC). */
function proposal(created: string, event: string, approved = false) {
  return {
    createdAt: new Date(`${created}T12:00:00-03:00`),
    startDate: new Date(`${event}T10:00:00Z`),
    approved,
  };
}

describe("buildLeadTime", () => {
  it("usa o ano local da criacao", () => {
    const rows = [{ createdAt: new Date("2025-12-31T23:30:00-03:00"), startDate: new Date("2026-01-10T10:00:00Z"), approved: true }];
    expect(buildLeadTime(rows, 2025).created).toBe(1);
    expect(buildLeadTime(rows, 2026).created).toBe(0);
    expect(buildLeadTime(rows, 2025).buckets[1]).toMatchObject({ key: "8-30", total: 1, approved: 1, approvalRate: 1 });
  });

  it("conta a antecedencia pela data local mesmo depois das 21:00", () => {
    const rows = [{ createdAt: new Date("2026-03-09T22:30:00-03:00"), startDate: new Date("2026-03-16T08:00:00Z"), approved: false }];
    expect(buildLeadTime(rows, 2026).medianDays).toBe(7);
    expect(buildLeadTime(rows, 2026).buckets[0].total).toBe(1);
  });

  it("coloca os limites nas faixas certas", () => {
    const leads = [0, 7, 8, 30, 31, 90, 91];
    const rows = leads.map((lead) => {
      const event = new Date(Date.UTC(2026, 0, 1 + lead, 10));
      return { createdAt: new Date("2026-01-01T12:00:00-03:00"), startDate: event, approved: false };
    });
    const data = buildLeadTime(rows, 2026);
    expect(data.buckets.map((bucket) => bucket.total)).toEqual([2, 2, 2, 1]);
    expect(data.buckets.map((bucket) => bucket.key)).toEqual(["0-7", "8-30", "31-90", "90+"]);
    expect(data.buckets[3]).toMatchObject({ minDays: 91, maxDays: null });
  });

  it("exclui evento antes da criacao da mediana e das faixas", () => {
    const data = buildLeadTime([
      proposal("2026-05-10", "2026-05-01", true),
      proposal("2026-05-10", "2026-05-20", true),
    ], 2026, "WEDDING");
    expect(data).toMatchObject({ eventCategory: "WEDDING", created: 2, considered: 1, excluded: 1, approved: 1, medianDays: 10 });
    expect(data.buckets.reduce((sum, bucket) => sum + bucket.total, 0)).toBe(data.considered);
  });

  it("calcula a mediana impar e par e devolve null sem consideradas", () => {
    expect(median([30, 1, 7])).toBe(7);
    expect(median([1, 2, 4, 10])).toBe(3);
    expect(median([1, 2])).toBe(1.5);
    expect(median([])).toBeNull();
    expect(buildLeadTime([], 2026).medianDays).toBeNull();
  });

  it("faixa vazia tem taxa nula", () => {
    const data = buildLeadTime([proposal("2026-05-10", "2026-05-12", false)], 2026);
    expect(data.buckets[0]).toMatchObject({ total: 1, approved: 0, approvalRate: 0 });
    expect(data.buckets[1]).toMatchObject({ total: 0, approvalRate: null });
    expect(data.eventCategory).toBeNull();
  });
});
