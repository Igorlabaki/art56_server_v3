import { describe, expect, it } from "vitest";
import { HttpBadRequestError } from "../errors/errors-type/htttp-bad-request-error";
import { EVENT_CATEGORIES, EVENT_CATEGORY_MESSAGE, eventCategoryCounts, resolveEventCategory } from "./event-category";

describe("categoria do evento", () => {
    it("tem as seis categorias na ordem da spec", () => {
        expect(EVENT_CATEGORIES).toEqual(["CORPORATE", "BIRTHDAY", "BACHELOR_PARTY", "WEDDING", "COFFEE_BREAK", "OTHER"]);
    });

    it("evento com categoria da lista devolve a categoria", () => {
        expect(resolveEventCategory("EVENT", "BIRTHDAY")).toBe("BIRTHDAY");
    });

    it.each([undefined, null, "", "FESTA", 1])("evento com %s recusa", (value) => {
        expect(() => resolveEventCategory("EVENT", value)).toThrow(HttpBadRequestError);
        expect(() => resolveEventCategory("EVENT", value)).toThrow(EVENT_CATEGORY_MESSAGE);
    });

    it.each(["PRODUCTION", "BARTER", "OVERNIGHT", "OTHER"])("%s grava null mesmo com categoria", (type) => {
        expect(resolveEventCategory(type, "BIRTHDAY")).toBeNull();
        expect(resolveEventCategory(type, undefined)).toBeNull();
    });
});

describe("contagem por categoria do evento", () => {
    it("devolve todas as categorias e o sem categoria, inclusive com zero", () => {
        expect(eventCategoryCounts([
            { eventCategory: "BIRTHDAY", count: 31 },
            { eventCategory: null, count: 40 },
        ])).toEqual([
            { key: "CORPORATE", count: 0 },
            { key: "BIRTHDAY", count: 31 },
            { key: "BACHELOR_PARTY", count: 0 },
            { key: "WEDDING", count: 0 },
            { key: "COFFEE_BREAK", count: 0 },
            { key: "OTHER", count: 0 },
            { key: null, count: 40 },
        ]);
    });

    it("soma valor desconhecido em outro", () => {
        const counts = eventCategoryCounts([
            { eventCategory: "OTHER", count: 2 },
            { eventCategory: "FESTA", count: 3 },
        ]);
        expect(counts.find((item) => item.key === "OTHER")?.count).toBe(5);
        expect(counts.reduce((sum, item) => sum + item.count, 0)).toBe(5);
    });

    it("sem propostas devolve tudo zerado", () => {
        expect(eventCategoryCounts([]).every((item) => item.count === 0)).toBe(true);
    });
});
