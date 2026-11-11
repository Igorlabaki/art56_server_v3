import { describe, expect, it } from "vitest";
import { HttpBadRequestError } from "../errors/errors-type/htttp-bad-request-error";
import { applyProposalDiscount, DISCOUNT_MESSAGE, discountPercentValue, discountRemovedSuffix, NO_DISCOUNT } from "./proposal-discount";

describe("applyProposalDiscount", () => {
    it("5800 com 10% da 580 de desconto e 5220 de total", () => {
        expect(applyProposalDiscount(5800, 10)).toEqual({ discountPercent: 10, discountAmount: 580, totalAmount: 5220 });
    });

    it("999,99 com 7,5% da 75 e 924,99", () => {
        expect(applyProposalDiscount(999.99, 7.5)).toEqual({ discountPercent: 7.5, discountAmount: 75, totalAmount: 924.99 });
    });

    it("100% zera o total e o desconto vale o subtotal", () => {
        expect(applyProposalDiscount(5800, 100)).toEqual({ discountPercent: 100, discountAmount: 5800, totalAmount: 0 });
    });

    it("0% mantem o subtotal", () => {
        expect(applyProposalDiscount(5800, 0)).toEqual({ ...NO_DISCOUNT, totalAmount: 5800 });
    });
});

describe("discountRemovedSuffix", () => {
    it("so aparece quando havia desconto, com virgula decimal", () => {
        expect(discountRemovedSuffix(10)).toBe(" (desconto de 10% removido)");
        expect(discountRemovedSuffix(7.5)).toBe(" (desconto de 7,5% removido)");
        expect(discountRemovedSuffix(0)).toBe("");
        expect(discountRemovedSuffix(undefined)).toBe("");
    });
});

describe("discountPercentValue", () => {
    it("0, undefined e null valem 0", () => {
        expect(discountPercentValue(0)).toBe(0);
        expect(discountPercentValue(undefined)).toBe(0);
        expect(discountPercentValue(null)).toBe(0);
        expect(applyProposalDiscount(5800, discountPercentValue(undefined)).discountAmount).toBe(0);
    });

    it("aceita de 0 a 100 com ate duas casas", () => {
        expect(discountPercentValue(10)).toBe(10);
        expect(discountPercentValue(7.5)).toBe(7.5);
        expect(discountPercentValue(0.29)).toBe(0.29);
        expect(discountPercentValue(100)).toBe(100);
    });

    it.each([-1, 100.01, 10.123, Number.NaN, Number.POSITIVE_INFINITY, "10", "abc", {}])("recusa %s", (raw) => {
        expect(() => discountPercentValue(raw)).toThrow(HttpBadRequestError);
        expect(() => discountPercentValue(raw)).toThrow(DISCOUNT_MESSAGE);
    });
});
