import { describe, expect, it } from "vitest";
import { resolveMinimumPrice } from "./resolve-minimum-price";

function on(isoDay: string) {
    return new Date(`${isoDay}T12:00:00.000Z`);
}

const december = { startDay: "01/12", endDay: "31/12", price: 15000 };
const newYear = { startDay: "28/12", endDay: "31/12", price: 20000 };
const yearTurn = { startDay: "20/12", endDay: "05/01", price: 18000 };

describe("resolveMinimumPrice", () => {
    it("usa a faixa quando a data de inicio cai dentro dela", () => {
        expect(resolveMinimumPrice({
            minimumPrice: 8000,
            periods: [december],
            startDate: on("2026-12-20"),
        })).toBe(15000);
    });

    it("usa o piso padrao fora de qualquer faixa", () => {
        expect(resolveMinimumPrice({
            minimumPrice: 8000,
            periods: [december],
            startDate: on("2026-03-12"),
        })).toBe(8000);
    });

    it("escolhe o maior preco quando duas faixas cobrem o dia", () => {
        expect(resolveMinimumPrice({
            minimumPrice: 8000,
            periods: [december, newYear],
            startDate: on("2026-12-30"),
        })).toBe(20000);
    });

    it("cobre a virada do ano e exclui o dia seguinte ao fim", () => {
        expect(resolveMinimumPrice({
            minimumPrice: 8000,
            periods: [yearTurn],
            startDate: on("2027-01-02"),
        })).toBe(18000);
        expect(resolveMinimumPrice({
            minimumPrice: 8000,
            periods: [yearTurn],
            startDate: on("2027-01-15"),
        })).toBe(8000);
    });

    it("evento que comeca antes da faixa usa o padrao", () => {
        expect(resolveMinimumPrice({
            minimumPrice: 8000,
            periods: [december],
            startDate: on("2026-11-30"),
        })).toBe(8000);
    });

    it("piso zero nao eleva o total", () => {
        expect(resolveMinimumPrice({
            minimumPrice: 0,
            periods: [],
            startDate: on("2026-03-12"),
        })).toBe(0);
        expect(resolveMinimumPrice({
            minimumPrice: 0,
            periods: [{ startDay: "01/12", endDay: "31/12", price: 0 }],
            startDate: on("2026-12-20"),
        })).toBe(0);
    });
});
