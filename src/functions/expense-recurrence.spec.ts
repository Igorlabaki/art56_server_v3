import { describe, expect, it } from "vitest";
import { HttpBadRequestError } from "../errors/errors-type/htttp-bad-request-error";
import { recurringAmounts, resolveExpenseTrafficSource } from "./expense-recurrence";

describe("valor da despesa recorrente", () => {
  it("semanal vale 52 semanas por ano", () => {
    expect(recurringAmounts("WEEKLY", 120)).toEqual({ monthly: 520, annual: 6240 });
  });

  it("quinzenal, mensal e anual mantem os valores de antes", () => {
    expect(recurringAmounts("BIWEEKLY", 100)).toEqual({ monthly: 200, annual: 2400 });
    expect(recurringAmounts("MONTHLY", 100)).toEqual({ monthly: 100, annual: 1200 });
    expect(recurringAmounts("ANNUAL", 1200)).toEqual({ monthly: 100, annual: 1200 });
  });

  it("esporadica nao recorre", () => {
    expect(recurringAmounts("SPORADIC", 500)).toEqual({ monthly: 0, annual: 0 });
  });
});

describe("canal da despesa", () => {
  it("Publicidade sem canal e recusada", () => {
    for (const missing of [undefined, null]) {
      expect(() => resolveExpenseTrafficSource("ADVERTISING", missing)).toThrow(HttpBadRequestError);
      expect(() => resolveExpenseTrafficSource("ADVERTISING", missing)).toThrow(
        "Informe o canal da despesa de Publicidade.",
      );
    }
  });

  it("Publicidade com canal grava o canal", () => {
    expect(resolveExpenseTrafficSource("ADVERTISING", "TIKTOK")).toBe("TIKTOK");
  });

  it("outra categoria descarta o canal", () => {
    expect(resolveExpenseTrafficSource("TAX", "INSTAGRAM")).toBeNull();
  });
});
