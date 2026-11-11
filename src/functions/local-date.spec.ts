import { describe, expect, it } from "vitest";
import { civilDayNumber, localDateParts } from "./local-date";

describe("localDateParts", () => {
  it("usa a data civil de Sao Paulo, nao a de UTC", () => {
    expect(localDateParts(new Date("2025-12-31T23:30:00-03:00"))).toEqual({ year: 2025, month: 12, day: 31 });
    expect(localDateParts(new Date("2026-03-10T02:00:00Z"))).toEqual({ year: 2026, month: 3, day: 9 });
    expect(localDateParts(new Date("2026-03-10T03:00:00Z"))).toEqual({ year: 2026, month: 3, day: 10 });
  });

  it("aceita outro fuso", () => {
    expect(localDateParts(new Date("2026-03-10T02:00:00Z"), "UTC")).toEqual({ year: 2026, month: 3, day: 10 });
  });
});

describe("civilDayNumber", () => {
  it("conta dias civis sem horario de verao nem anos de 0 a 99", () => {
    expect(civilDayNumber({ year: 1970, month: 1, day: 1 })).toBe(0);
    expect(civilDayNumber({ year: 2026, month: 3, day: 1 }) - civilDayNumber({ year: 2026, month: 2, day: 28 })).toBe(1);
    expect(civilDayNumber({ year: 6, month: 1, day: 1 })).toBeLessThan(civilDayNumber({ year: 1900, month: 1, day: 1 }));
  });
});
