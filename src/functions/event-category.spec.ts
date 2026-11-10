import { describe, expect, it } from "vitest";
import { HttpBadRequestError } from "../errors/errors-type/htttp-bad-request-error";
import { EVENT_CATEGORIES, EVENT_CATEGORY_MESSAGE, resolveEventCategory } from "./event-category";

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
