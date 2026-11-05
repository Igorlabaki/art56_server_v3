import { describe, expect, it } from "vitest";
import { proposalListRange } from "./wall-clock-datetime";

describe("proposalListRange", () => {
  it("mes wall-clock inclui o dia 1 as 23:00Z e exclui o mes seguinte", () => {
    const range = proposalListRange({ month: 11, year: 2026 });
    expect(range).toEqual({
      gte: new Date("2026-11-01T00:00:00.000Z"),
      lt: new Date("2026-12-01T00:00:00.000Z"),
    });
    if (range === null || range === "invalid-day") return;
    const evening = new Date("2026-11-01T23:00:00.000Z");
    expect(evening >= range.gte && evening < range.lt).toBe(true);
    expect(new Date("2026-12-01T00:00:00.000Z") < range.lt).toBe(false);
  });

  it("dia devolve so aquele dia civil", () => {
    expect(proposalListRange({ month: 11, year: 2026, day: 6 })).toEqual({
      gte: new Date("2026-11-06T00:00:00.000Z"),
      lt: new Date("2026-11-07T00:00:00.000Z"),
    });
  });

  it("dia 31 num mes de 30 nao estoura para o mes seguinte", () => {
    expect(proposalListRange({ month: 4, year: 2026, day: 31 })).toBe("invalid-day");
  });

  it("sem mes nao filtra data", () => {
    expect(proposalListRange({})).toBeNull();
  });
});
