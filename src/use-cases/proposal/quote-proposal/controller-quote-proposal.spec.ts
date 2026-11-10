import { describe, expect, it, vi } from "vitest";
import { proposalRoutes } from "../../../router/proposal";
import { QuoteProposalController } from "./controller-quote-proposal";

const allowedKeys = [
    "basePrice",
    "extraHoursQty",
    "extraHourPrice",
    "totalAmountService",
    "totalAmount",
    "minimumApplied",
];

const body = {
    venueId: "venue-1",
    date: "2026-11-20",
    startHour: "18:00",
    endHour: "22:00",
    guestNumber: 10,
    type: "EVENT",
};

function responseDouble() {
    return {
        statusCode: 0,
        body: null as { data?: Record<string, unknown>; message?: string } | null,
        status(code: number) {
            this.statusCode = code;
            return this;
        },
        json(payload: { data?: Record<string, unknown>; message?: string }) {
            this.body = payload;
            return this;
        },
    };
}

describe("QuoteProposalController", () => {
    it("responde 200 so com os valores da cotacao", async () => {
        const execute = vi.fn(async () => ({
            success: true,
            message: "Cotação calculada",
            data: {
                basePrice: 1000,
                extraHoursQty: 0,
                extraHourPrice: 167,
                totalAmountService: 500,
                totalAmount: 1500,
                minimumApplied: false,
                pricePerPerson: 100,
                increasePercent: 20,
                monthlyRevenue: 5000,
            },
        }));
        const subject = new QuoteProposalController({ execute } as never);
        const resp = responseDouble();

        await subject.handle({ body, user: { id: "user-1" } } as never, resp as never);

        expect(resp.statusCode).toBe(200);
        expect(execute).toHaveBeenCalledWith(expect.objectContaining({ userId: "user-1", serviceIds: [], serviceHours: [] }));
        expect(Object.keys(resp.body?.data ?? {}).sort()).toEqual([...allowedKeys].sort());
        const serialized = JSON.stringify(resp.body);
        expect(serialized).not.toContain("pricePerPerson");
        expect(serialized).not.toContain("increasePercent");
        expect(serialized).not.toContain("monthlyRevenue");
    });

    it("corpo invalido nao chama o use case", async () => {
        const execute = vi.fn();
        const subject = new QuoteProposalController({ execute } as never);
        const resp = responseDouble();

        await subject.handle({ body: { ...body, date: "20/11/2026", guestNumber: 0 }, user: { id: "user-1" } } as never, resp as never);

        expect(resp.statusCode).toBe(400);
        expect(execute).not.toHaveBeenCalled();
    });

    it("a rota exige autenticacao", () => {
        const layer = proposalRoutes.stack.find((item) => item.route?.path === "/quote");
        expect(layer).toBeTruthy();
        const names = layer?.route?.stack.map((handler) => handler.name) ?? [];
        expect(names).toContain("ensureAuthenticate");
    });
});
