import { describe, expect, it } from "vitest";
import { previousYearWindow, yearlyChange } from "./yearly-change";

describe("yearlyChange", () => {
  it("devolve o percentual inteiro de alta, queda e igualdade", () => {
    expect(yearlyChange(248, 175)).toBe(42);
    expect(yearlyChange(3, 5)).toBe(-40);
    expect(yearlyChange(9089, 9089)).toBe(0);
  });

  it("responde -100 quando o ano atual zera", () => {
    expect(yearlyChange(0, 4)).toBe(-100);
  });

  it("responde null sem base no ano anterior", () => {
    expect(yearlyChange(5, 0)).toBeNull();
    expect(yearlyChange(0, 0)).toBeNull();
  });

  it("arredonda com Math.round, -10,5 vira -10", () => {
    expect(yearlyChange(179, 200)).toBe(-10);
    expect(yearlyChange(243, 200)).toBe(22);
  });
});

describe("previousYearWindow", () => {
  it("devolve o mesmo mes do ano anterior", () => {
    expect(previousYearWindow(2026, 10)).toEqual({
      start: new Date(2025, 10, 1),
      end: new Date(2025, 11, 0),
    });
  });

  it("compara janeiro com janeiro do ano anterior, nao com dezembro", () => {
    expect(previousYearWindow(2026, 0)).toEqual({
      start: new Date(2025, 0, 1),
      end: new Date(2025, 1, 0),
    });
  });

  it("cobre o ano anterior inteiro em Anual", () => {
    expect(previousYearWindow(2026, null)).toEqual({
      start: new Date(2025, 0, 1),
      end: new Date(2025, 11, 31),
    });
  });

  it("usa o fim de fevereiro do proprio ano anterior", () => {
    expect(previousYearWindow(2025, 1).end).toEqual(new Date(2024, 1, 29));
  });
});
