import { describe, expect, it } from "vitest";
import { buildServiceAdherence } from "./report-service-adherence";

const line = (serviceId: string, amount: number | null, name = serviceId) => ({ serviceId, amount, service: { name } });

describe("buildServiceAdherence", () => {
  it("conta propostas distintas e calcula a adesao", () => {
    const data = buildServiceAdherence([
      { proposalServices: [line("dj", 100)] },
      { proposalServices: [line("dj", 200), line("dj", 50)] },
      { proposalServices: [] },
      { proposalServices: [line("buffet", null)] },
    ], 2026, "WEDDING");
    expect(data.approvedProposals).toBe(4);
    expect(data.eventCategory).toBe("WEDDING");
    expect(data.services[0]).toEqual({
      serviceId: "dj",
      name: "dj",
      proposals: 2,
      adherence: 0.5,
      amountSum: 350,
      linesWithAmount: 3,
      linesTotal: 3,
    });
  });

  it("mesmo servico duas vezes na proposta conta uma proposta e duas linhas", () => {
    const data = buildServiceAdherence([{ proposalServices: [line("dj", 10), line("dj", 15)] }], 2026);
    expect(data.services[0]).toMatchObject({ proposals: 1, linesTotal: 2, amountSum: 25, adherence: 1 });
  });

  it("valor zero conta como registrado e null fica fora da soma", () => {
    const data = buildServiceAdherence([
      { proposalServices: [line("dj", 100)] },
      { proposalServices: [line("dj", null)] },
      { proposalServices: [line("dj", 0)] },
      { proposalServices: [line("foto", null)] },
    ], 2026);
    const dj = data.services.find((item) => item.serviceId === "dj")!;
    expect(dj).toMatchObject({ amountSum: 100, linesWithAmount: 2, linesTotal: 3 });
    expect(data.services.find((item) => item.serviceId === "foto")!.amountSum).toBeNull();
  });

  it("zero aprovadas devolve lista vazia", () => {
    expect(buildServiceAdherence([], 2026)).toEqual({ year: 2026, eventCategory: null, approvedProposals: 0, services: [] });
  });

  it("ordena por propostas, depois soma (null por ultimo), depois nome", () => {
    const data = buildServiceAdherence([
      { proposalServices: [line("a", null, "Bolo"), line("b", 10, "Som"), line("c", 50, "Luz"), line("d", null, "Arte"), line("e", 1, "Flores")] },
      { proposalServices: [line("e", 1, "Flores")] },
    ], 2026);
    expect(data.services.map((item) => item.name)).toEqual(["Flores", "Luz", "Som", "Arte", "Bolo"]);
  });
});
