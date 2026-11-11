import { describe, expect, it } from "vitest";
import { reportYearRange } from "./report-year-range";

describe("intervalo do ano nos relatorios", () => {
    it("vai de 1/1 do ano ate antes de 1/1 do ano seguinte", () => {
        const range = reportYearRange(2026);
        expect(range.gte.toISOString()).toBe("2026-01-01T00:00:00.000Z");
        expect(range.lt.toISOString()).toBe("2027-01-01T00:00:00.000Z");
    });

    it("31/12 entra e janeiro do ano seguinte fica fora", () => {
        const range = reportYearRange(2026);
        const lastDay = new Date("2026-12-31T23:00:00.000Z");
        const nextJanuary = new Date("2027-01-15T12:00:00.000Z");
        expect(lastDay >= range.gte && lastDay < range.lt).toBe(true);
        expect(nextJanuary < range.lt).toBe(false);
    });

    it("sem ano usa o ano atual", () => {
        expect(reportYearRange(undefined).gte.getUTCFullYear()).toBe(new Date().getFullYear());
    });
});
