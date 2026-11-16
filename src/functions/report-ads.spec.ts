import { describe, expect, it } from "vitest";
import { TrafficSource } from "@prisma/client";
import { AdsExpenseRow, AdsProposalRow, buildAdsReport } from "./report-ads";

const NOW = new Date("2026-12-10T15:00:00.000Z");

function recurring(createdAt: string, amount: number, overrides: Partial<AdsExpenseRow> = {}): AdsExpenseRow {
  return {
    amount,
    type: "MONTHLY",
    recurring: true,
    paymentDate: null,
    createdAt: new Date(createdAt),
    trafficSource: "INSTAGRAM",
    ...overrides,
  };
}

function sporadic(amount: number, overrides: Partial<AdsExpenseRow> = {}): AdsExpenseRow {
  return {
    amount,
    type: "SPORADIC",
    recurring: false,
    paymentDate: null,
    createdAt: new Date("2026-06-01T12:00:00.000Z"),
    trafficSource: "INSTAGRAM",
    ...overrides,
  };
}

function proposal(trafficSource: TrafficSource, approved = false, totalAmount = 0, createdAt = "2026-05-10T15:00:00.000Z"): AdsProposalRow {
  return { createdAt: new Date(createdAt), trafficSource, approved, totalAmount };
}

const row = (data: ReturnType<typeof buildAdsReport>, channel: string | null) =>
  data.rows.find((item) => item.channel === channel);

describe("buildAdsReport", () => {
  it("recorrente conta do mes de cadastro ate o mes atual", () => {
    const novembro = [recurring("2026-11-05T12:00:00.000Z", 1000)];
    expect(buildAdsReport(novembro, [], 2026, NOW).total.spent).toBe(2000);

    const dezembroPassado = [recurring("2025-12-20T12:00:00.000Z", 1000)];
    expect(buildAdsReport(dezembroPassado, [], 2026, NOW).total.spent).toBe(12000);
    expect(buildAdsReport(dezembroPassado, [], 2025, NOW).total.spent).toBe(1000);
  });

  it("ano futuro nao conta e semanal usa 52 semanas", () => {
    const mensal = [recurring("2025-12-20T12:00:00.000Z", 1000)];
    expect(buildAdsReport(mensal, [], 2027, NOW).total.spent).toBe(0);

    const semanal = [recurring("2026-01-15T12:00:00.000Z", 120, { type: "WEEKLY" })];
    expect(buildAdsReport(semanal, [], 2026, new Date("2026-03-20T15:00:00.000Z")).total.spent).toBeCloseTo(1560);
  });

  it("esporadica usa o ano UTC do pagamento ou o ano local do cadastro", () => {
    const pagaEm1Jan = [sporadic(400, { paymentDate: new Date("2026-01-01T00:00:00.000Z") })];
    expect(buildAdsReport(pagaEm1Jan, [], 2026, NOW).total.spent).toBe(400);
    expect(buildAdsReport(pagaEm1Jan, [], 2025, NOW).total.spent).toBe(0);

    const semData = [sporadic(400, { createdAt: new Date("2026-01-01T01:00:00.000Z") })];
    expect(buildAdsReport(semData, [], 2025, NOW).total.spent).toBe(400);
    expect(buildAdsReport(semData, [], 2026, NOW).total.spent).toBe(0);
  });

  it("proposta criada em 31/12 local fica fora do ano seguinte", () => {
    const data = buildAdsReport([], [proposal("INSTAGRAM", true, 1000, "2026-01-01T02:00:00.000Z")], 2026, NOW);
    expect(row(data, "INSTAGRAM")!.proposals).toBe(0);
    expect(buildAdsReport([], [proposal("INSTAGRAM", true, 1000, "2026-01-01T02:00:00.000Z")], 2025, NOW).total.proposals).toBe(1);
  });

  it("calcula custo por orcamento, por evento e retorno do canal", () => {
    const proposals = [
      ...Array.from({ length: 6 }, () => proposal("INSTAGRAM", true, 4000)),
      ...Array.from({ length: 24 }, () => proposal("INSTAGRAM")),
    ];
    const data = buildAdsReport([sporadic(3000, { paymentDate: new Date("2026-03-01T00:00:00.000Z") })], proposals, 2026, NOW);
    expect(row(data, "INSTAGRAM")).toEqual({
      channel: "INSTAGRAM",
      spent: 3000,
      proposals: 30,
      events: 6,
      revenue: 24000,
      costPerProposal: 100,
      costPerEvent: 500,
      roas: 8,
    });
  });

  it("canal so com gasto ou so com orcamentos tem custos nulos", () => {
    const data = buildAdsReport(
      [sporadic(500, { paymentDate: new Date("2026-03-01T00:00:00.000Z"), trafficSource: "TIKTOK" })],
      [proposal("GOOGLE", true, 2000)],
      2026,
      NOW,
    );
    expect(row(data, "TIKTOK")).toMatchObject({ costPerProposal: null, costPerEvent: null, roas: 0 });
    expect(row(data, "GOOGLE")).toMatchObject({ proposals: 1, costPerProposal: null, costPerEvent: null, roas: null });
  });

  it("gasto sem canal vira a linha Sem canal e entra no total", () => {
    const data = buildAdsReport(
      [
        sporadic(500, { paymentDate: new Date("2026-03-01T00:00:00.000Z"), trafficSource: null }),
        sporadic(1000, { paymentDate: new Date("2026-03-01T00:00:00.000Z") }),
      ],
      [],
      2026,
      NOW,
    );
    expect(row(data, null)).toEqual({
      channel: null,
      spent: 500,
      proposals: 0,
      events: 0,
      revenue: 0,
      costPerProposal: null,
      costPerEvent: null,
      roas: null,
    });
    expect(data.total.spent).toBe(1500);
    expect(data.rows.reduce((sum, item) => sum + item.spent, 0)).toBe(data.total.spent);
  });

  it("ignora indicacao e Airbnb e mantem os cinco canais na ordem", () => {
    const data = buildAdsReport([], [proposal("FRIEND", true, 5000), proposal("AIRBNB", true, 5000), proposal("FACEBOOK")], 2026, NOW);
    expect(data.rows.map((item) => item.channel)).toEqual(["INSTAGRAM", "FACEBOOK", "TIKTOK", "GOOGLE", "OTHER"]);
    expect(data.total).toMatchObject({ spent: 0, proposals: 1, events: 0, revenue: 0, roas: null });
    expect(data.year).toBe(2026);
  });
});
