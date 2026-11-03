import { SeasonalFee } from "@prisma/client";
import { format } from "date-fns";
import { describe, expect, it } from "vitest";
import { applySeasonalFeeToUnitPrice } from "./adjust-proposal-unit-price";

function fee(partial: Partial<SeasonalFee> & Pick<SeasonalFee, "type" | "fee">): SeasonalFee {
    return {
        id: "fee-1",
        title: "ajuste",
        startDay: null,
        endDay: null,
        venueId: "venue-1",
        affectedDays: null,
        ...partial,
    };
}

describe("applySeasonalFeeToUnitPrice", () => {
    const inJanuary = new Date(2026, 0, 15, 12, 0, 0);

    it("soma adicional e subtrai desconto no preco unitario", () => {
        const price = applySeasonalFeeToUnitPrice(200, [
            fee({ type: "SURCHARGE", fee: 10, startDay: "01/01", endDay: "31/01" }),
            fee({ id: "fee-2", type: "DISCOUNT", fee: 5, startDay: "01/01", endDay: "31/01" }),
        ], inJanuary);

        expect(price).toBe(210);
    });

    it("ignora ajuste fora da vigencia", () => {
        const price = applySeasonalFeeToUnitPrice(200, [
            fee({ type: "SURCHARGE", fee: 10, startDay: "01/01", endDay: "31/01" }),
        ], new Date(2026, 5, 15, 12, 0, 0));

        expect(price).toBe(200);
    });

    it("aplica intervalo que cruza a virada do ano no mesmo criterio da criacao", () => {
        const price = applySeasonalFeeToUnitPrice(100, [
            fee({ type: "SURCHARGE", fee: 20, startDay: "20/12", endDay: "10/01" }),
        ], new Date(2026, 11, 25, 12, 0, 0));

        expect(price).toBe(120);
    });

    it("aplica pelo dia da semana e por todos os dias", () => {
        const day = format(inJanuary, "EEEE").toLowerCase();

        expect(applySeasonalFeeToUnitPrice(100, [
            fee({ type: "DISCOUNT", fee: 10, affectedDays: day }),
        ], inJanuary)).toBe(90);

        expect(applySeasonalFeeToUnitPrice(100, [
            fee({ type: "SURCHARGE", fee: 10, affectedDays: "all" }),
        ], inJanuary)).toBe(110);
    });

    it("conta o percentual uma vez quando a data e o dia da semana coincidem", () => {
        const day = format(inJanuary, "EEEE").toLowerCase();
        const price = applySeasonalFeeToUnitPrice(100, [
            fee({ type: "SURCHARGE", fee: 10, startDay: "01/01", endDay: "31/01", affectedDays: day }),
        ], inJanuary);

        expect(price).toBe(110);
    });
});
