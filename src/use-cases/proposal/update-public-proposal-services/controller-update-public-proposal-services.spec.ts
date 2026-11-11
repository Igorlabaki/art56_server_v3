import { describe, expect, it, vi } from "vitest";
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { proposalRoutes } from "../../../router/proposal";
import { UpdatePublicProposalServicesController } from "./controller-update-public-proposal-services";

const serviceId = "11111111-1111-4111-8111-111111111111";

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

function controller(methods: { execute?: ReturnType<typeof vi.fn>; list?: ReturnType<typeof vi.fn> }) {
    return new UpdatePublicProposalServicesController({
        execute: methods.execute ?? vi.fn(),
        list: methods.list ?? vi.fn(),
    } as never);
}

describe("UpdatePublicProposalServicesController", () => {
    it("PUT publico grava so os ids e a resposta nao traz preco unitario", async () => {
        const execute = vi.fn(async () => ({
            success: true,
            message: "Serviços atualizados",
            data: {
                id: "proposal-1",
                totalAmount: 750,
                price: 80,
                unitPrice: 80,
                pricingType: "FIXED",
                proposalServices: [{
                    id: "line-1",
                    serviceId,
                    amount: 50,
                    price: 50,
                    unitPrice: 50,
                    pricingType: "FIXED",
                    service: {
                        name: "Limpeza",
                        rpaRequired: true,
                        rpaMinPeople: 1,
                        price: 50,
                        unitPrice: 50,
                        pricingType: "FIXED",
                        description: "interna",
                        imageUrl: "https://cdn.example/limpeza.jpg",
                    },
                }],
            },
        }));
        const subject = controller({ execute });
        const resp = responseDouble();

        await subject.update({
            params: { proposalId: "proposal-1" },
            body: { serviceIds: [serviceId], price: 999, totalAmount: 1 },
        } as never, resp as never);

        expect(resp.statusCode).toBe(200);
        expect(execute).toHaveBeenCalledWith({ proposalId: "proposal-1", serviceIds: [serviceId] });
        expect(execute.mock.calls[0][0]).not.toHaveProperty("price");
        const serialized = JSON.stringify(resp.body);
        expect(serialized).not.toContain("unitPrice");
        expect(serialized).not.toContain("pricingType");
        expect(serialized).not.toContain("\"price\"");
        expect(serialized).not.toContain("interna");
        expect(serialized).not.toContain("cdn.example");
        expect(resp.body?.data).toMatchObject({
            id: "proposal-1",
            totalAmount: 750,
            proposalServices: [{
                id: "line-1",
                serviceId,
                amount: 50,
                service: { name: "Limpeza", rpaRequired: true, rpaMinPeople: 1 },
            }],
        });
    });

    it("envia as horas e descarta o preco do corpo", async () => {
        const execute = vi.fn(async () => ({
            success: true,
            message: "Serviços atualizados",
            data: { id: "proposal-1", totalAmount: 750, proposalServices: [] },
        }));
        const subject = controller({ execute });
        const resp = responseDouble();

        await subject.update({
            params: { proposalId: "proposal-1" },
            body: {
                serviceIds: [serviceId],
                serviceHours: [{ serviceId, hours: 3 }],
                price: 999,
                unitPrice: 10,
            },
        } as never, resp as never);

        expect(resp.statusCode).toBe(200);
        expect(execute).toHaveBeenCalledWith({
            proposalId: "proposal-1",
            serviceIds: [serviceId],
            serviceHours: [{ serviceId, hours: 3 }],
        });
        expect(execute.mock.calls[0][0]).not.toHaveProperty("price");
        expect(execute.mock.calls[0][0]).not.toHaveProperty("unitPrice");
    });

    it("descarta cortesia do corpo e devolve a cortesia gravada sem unitario", async () => {
        const execute = vi.fn(async () => ({
            success: true,
            message: "Serviços atualizados",
            data: {
                id: "proposal-1",
                totalAmount: 750,
                proposalServices: [{
                    id: "line-1",
                    serviceId,
                    amount: 40,
                    unitPrice: 40,
                    courtesyQuantity: 2,
                    courtesyAmount: 80,
                    service: { name: "Som", rpaRequired: false, rpaMinPeople: null },
                }],
            },
        }));
        const subject = controller({ execute });
        const resp = responseDouble();

        await subject.update({
            params: { proposalId: "proposal-1" },
            body: { serviceIds: [serviceId], serviceCourtesy: [{ serviceId, quantity: 3 }] },
        } as never, resp as never);

        expect(resp.statusCode).toBe(200);
        expect(execute).toHaveBeenCalledWith({ proposalId: "proposal-1", serviceIds: [serviceId] });
        expect(JSON.stringify(resp.body)).not.toContain("unitPrice");
        expect(resp.body?.data).toMatchObject({
            proposalServices: [{ serviceId, amount: 40, courtesyQuantity: 2, courtesyAmount: 80 }],
        });
    });

    it("aceita lista vazia", async () => {
        const execute = vi.fn(async () => ({
            success: true,
            message: "Serviços atualizados",
            data: { id: "proposal-1", totalAmount: 700, proposalServices: [] },
        }));
        const subject = controller({ execute });
        const resp = responseDouble();

        await subject.update({
            params: { proposalId: "proposal-1" },
            body: { serviceIds: [] },
        } as never, resp as never);

        expect(resp.statusCode).toBe(200);
        expect(execute).toHaveBeenCalledWith({ proposalId: "proposal-1", serviceIds: [] });
    });

    it("mais de 100 ids nao chama o use case", async () => {
        const execute = vi.fn();
        const subject = controller({ execute });
        const resp = responseDouble();
        const serviceIds = Array.from({ length: 101 }, (_, index) => {
            const tail = String(index + 1).padStart(12, "0");
            return `11111111-1111-4111-8111-${tail}`;
        });

        await subject.update({
            params: { proposalId: "proposal-1" },
            body: { serviceIds },
        } as never, resp as never);

        expect(resp.statusCode).toBe(400);
        expect(execute).not.toHaveBeenCalled();
    });

    it("orcamento confirmado devolve a mensagem e nao grava", async () => {
        const execute = vi.fn(async () => {
            throw new HttpBadRequestError("Este orçamento já foi confirmado e não pode ser alterado.");
        });
        const subject = controller({ execute });
        const resp = responseDouble();

        await subject.update({
            params: { proposalId: "proposal-1" },
            body: { serviceIds: [] },
        } as never, resp as never);

        expect(resp.statusCode).toBe(400);
        expect(JSON.stringify(resp.body)).toContain("Este orçamento já foi confirmado e não pode ser alterado.");
    });

    it("GET nao devolve preco unitario", async () => {
        const list = vi.fn(async () => ({
            success: true,
            message: "Serviços do orçamento",
            data: {
                services: [{
                    id: serviceId,
                    name: "Limpeza",
                    amount: 50,
                    required: true,
                    minPeople: 1,
                    selected: true,
                    price: 50,
                    unitPrice: 50,
                    pricingType: "FIXED",
                }],
            },
        }));
        const subject = controller({ list });
        const resp = responseDouble();

        await subject.list({ params: { proposalId: "proposal-1" } } as never, resp as never);

        expect(resp.statusCode).toBe(200);
        expect(JSON.stringify(resp.body)).not.toContain("unitPrice");
        expect(JSON.stringify(resp.body)).not.toContain("pricingType");
        expect(resp.body?.data).toEqual({
            services: [{
                id: serviceId,
                name: "Limpeza",
                amount: 50,
                required: true,
                minPeople: 1,
                selected: true,
                hourly: false,
                hours: null,
            }],
        });
    });

    it("GET e PUT nao exigem autenticacao", () => {
        for (const path of ["/presentation/:proposalId/services"]) {
            const layers = proposalRoutes.stack.filter((item) => item.route?.path === path);
            expect(layers).toHaveLength(2);
            for (const layer of layers) {
                const names = layer.route?.stack.map((handler) => handler.name) ?? [];
                expect(names).not.toContain("ensureAuthenticate");
            }
        }
    });
});
