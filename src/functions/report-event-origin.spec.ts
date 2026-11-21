import { describe, expect, it } from "vitest";
import { buildEventOrigin, EventOriginRow } from "./report-event-origin";

const row = (city: string | null, state: string | null, neighborhood: string | null): EventOriginRow => ({
  city,
  state,
  neighborhood,
});

describe("buildEventOrigin", () => {
  it("junta caixa diferente e usa o trim da primeira linha", () => {
    const data = buildEventOrigin(
      [
        row("  Sao Paulo  ", " SP ", " Centro "),
        row("sao paulo", "sp", "centro"),
      ],
      2026,
    );

    expect(data.events).toBe(2);
    expect(data.cities).toEqual([{ label: "Sao Paulo", count: 2 }]);
    expect(data.states).toEqual([{ label: "SP", count: 2 }]);
    expect(data.neighborhoods).toEqual([{ label: "Centro", count: 2 }]);
    expect(data.cities.reduce((sum, item) => sum + item.count, 0)).toBe(data.events);
    expect(data.states.reduce((sum, item) => sum + item.count, 0)).toBe(data.events);
    expect(data.neighborhoods.reduce((sum, item) => sum + item.count, 0)).toBe(data.events);
  });

  it("nao une acento diferente nem espaco no meio", () => {
    const data = buildEventOrigin(
      [
        row("Sao Paulo", "SP", "Centro"),
        row("São Paulo", "SP", "Centro"),
        row("São  Paulo", "SP", "Centro"),
      ],
      2026,
    );

    expect(data.events).toBe(3);
    expect(data.cities.map((item) => item.label).sort()).toEqual(["Sao Paulo", "São  Paulo", "São Paulo"]);
    expect(data.cities.every((item) => item.count === 1)).toBe(true);
  });

  it("deixa de fora linha com cidade, estado ou bairro vazio", () => {
    const data = buildEventOrigin(
      [
        row("Campinas", "SP", "Centro"),
        row(null, "SP", "Centro"),
        row("Campinas", "  ", "Centro"),
        row("Campinas", "SP", null),
      ],
      2026,
    );

    expect(data.events).toBe(1);
    expect(data.cities).toEqual([{ label: "Campinas", count: 1 }]);
    expect(data.states).toEqual([{ label: "SP", count: 1 }]);
    expect(data.neighborhoods).toEqual([{ label: "Centro", count: 1 }]);
  });

  it("ordena pela quantidade e, no empate, pelo rotulo", () => {
    const data = buildEventOrigin(
      [
        row("Santos", "SP", "Gonzaga"),
        row("Rio", "RJ", "Centro"),
        row("Campinas", "MG", "Cambuí"),
        row("Rio", "RJ", "Centro"),
      ],
      2026,
    );

    expect(data.cities.map((item) => item.label)).toEqual(["Rio", "Campinas", "Santos"]);
    expect(data.states.map((item) => item.label)).toEqual(["RJ", "MG", "SP"]);
    expect(data.neighborhoods.map((item) => item.label)).toEqual(["Centro", "Cambuí", "Gonzaga"]);
  });

  it("so devolve ano, total e as tres listas", () => {
    const data = buildEventOrigin([], 2026);
    expect(Object.keys(data).sort()).toEqual(["cities", "events", "neighborhoods", "states", "year"]);
    expect(data).toEqual({ year: 2026, events: 0, cities: [], states: [], neighborhoods: [] });
  });
});
