import { describe, expect, it } from "vitest";
import { reportParamsSchema } from "./report-params-schema";

describe("reportParamsSchema", () => {
    it("converte a query e aceita month e eventCategory ausentes", () => {
        expect(reportParamsSchema.parse({ venueId: "venue-a", year: "2026" })).toEqual({ venueId: "venue-a", year: 2026 });
        expect(reportParamsSchema.parse({ venueId: "venue-a", year: "2026", month: "12", eventCategory: "NONE" }))
            .toEqual({ venueId: "venue-a", year: 2026, month: 12, eventCategory: "NONE" });
        expect(reportParamsSchema.parse({ venueId: "venue-a", year: "2026", eventCategory: "WEDDING" }).eventCategory)
            .toBe("WEDDING");
    });

    it("rejeita ano fora da faixa, mes invalido, categoria desconhecida e venue vazio", () => {
        expect(reportParamsSchema.safeParse({ venueId: "venue-a", year: "1999" }).success).toBe(false);
        expect(reportParamsSchema.safeParse({ venueId: "venue-a", year: "2026.5" }).success).toBe(false);
        expect(reportParamsSchema.safeParse({ venueId: "venue-a", year: "abc" }).success).toBe(false);
        expect(reportParamsSchema.safeParse({ venueId: "venue-a", year: "2026", month: "13" }).success).toBe(false);
        expect(reportParamsSchema.safeParse({ venueId: "venue-a", year: "2026", month: "0" }).success).toBe(false);
        expect(reportParamsSchema.safeParse({ venueId: "venue-a", year: "2026", eventCategory: "FESTA" }).success).toBe(false);
        expect(reportParamsSchema.safeParse({ venueId: " ", year: "2026" }).success).toBe(false);
    });
});
