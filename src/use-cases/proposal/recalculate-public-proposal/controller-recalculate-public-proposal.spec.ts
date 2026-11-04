import { describe, expect, it, vi } from "vitest";
import { proposalRoutes } from "../../../router/proposal";
import { RecalculatePublicProposalController } from "./controller-recalculate-public-proposal";

const allowedKeys = [
    "id",
    "startDate",
    "endDate",
    "guestNumber",
    "basePrice",
    "extraHoursQty",
    "extraHourPrice",
    "totalAmount",
];

function responseDouble() {
    return {
        statusCode: 0,
        body: null as { data?: Record<string, unknown>; message?: string } | null,
        status(code: number) {
            this.statusCode = code;
            return this;
        },
        json(body: { data?: Record<string, unknown>; message?: string }) {
            this.body = body;
            return this;
        },
    };
}

describe("RecalculatePublicProposalController", () => {
    it("responde 200 so com data, convidados e valores", async () => {
        const execute = vi.fn(async () => ({
            success: true,
            message: "Orçamento atualizado",
            data: {
                id: "proposal-1",
                startDate: new Date("2026-11-20T14:00:00.000Z"),
                endDate: new Date("2026-11-20T22:00:00.000Z"),
                guestNumber: 29,
                basePrice: 5220,
                extraHoursQty: 2,
                extraHourPrice: 870,
                totalAmount: 7260,
                pricePerPerson: 180,
                pricePerDay: 1000,
                pricePerPersonDay: 90,
                pricePerPersonHour: 10,
                completeClientName: "Cliente",
                cpf: "000",
                payments: [{ amount: 10 }],
                email: "cliente@email.com",
            },
        }));
        const subject = new RecalculatePublicProposalController({ execute } as never);
        const resp = responseDouble();

        await subject.handle({
            params: { proposalId: "proposal-1" },
            body: { date: "2026-11-20", guestNumber: 29, hours: 8 },
        } as never, resp as never);

        expect(resp.statusCode).toBe(200);
        expect(Object.keys(resp.body?.data ?? {}).sort()).toEqual([...allowedKeys].sort());
        const serialized = JSON.stringify(resp.body);
        expect(serialized).not.toContain("pricePerPerson");
        expect(serialized).not.toContain("pricePerDay");
        expect(serialized).not.toContain("pricePerPersonDay");
        expect(serialized).not.toContain("pricePerPersonHour");
        expect(serialized).not.toContain("Cliente");
        expect(serialized).not.toContain("cliente@email.com");
        expect(serialized).not.toContain("payments");
    });

    it("corpo invalido nao chama o use case", async () => {
        const execute = vi.fn();
        const subject = new RecalculatePublicProposalController({ execute } as never);
        const resp = responseDouble();

        await subject.handle({
            params: { proposalId: "proposal-1" },
            body: { date: "20/11/2026", guestNumber: 0, hours: 0 },
        } as never, resp as never);

        expect(resp.statusCode).toBe(400);
        expect(execute).not.toHaveBeenCalled();
    });

    it("a rota publica nao exige autenticacao", () => {
        const layer = proposalRoutes.stack.find((item) => item.route?.path === "/presentation/:proposalId/recalculate");
        expect(layer).toBeTruthy();
        const names = layer?.route?.stack.map((handler) => handler.name) ?? [];
        expect(names).not.toContain("ensureAuthenticate");
    });
});
