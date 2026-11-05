import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { HISTORY_ACTION, UpdatePublicProposalServicesUseCase } from "./use-case-update-public-proposal-services";

describe("UpdatePublicProposalServicesUseCase", () => {
    const proposalRepository = {
        getById: vi.fn(),
        update: vi.fn(async (param: { proposalId: string }) => ({ id: param.proposalId })),
    };
    const serviceRepository = { getByVenueId: vi.fn() };
    const historyRepository = { create: vi.fn() };

    const useCase = new UpdatePublicProposalServicesUseCase(
        serviceRepository as never,
        historyRepository as never,
        proposalRepository as never,
    );

    const optional = {
        id: "svc-bar",
        venueId: "venue-1",
        name: "Bar",
        price: 80,
        pricingType: "FIXED" as const,
        rpaRequired: false,
        rpaMinPeople: null,
    };
    const cleanup = {
        id: "svc-limpeza",
        venueId: "venue-1",
        name: "Limpeza",
        price: 50,
        pricingType: "FIXED" as const,
        rpaRequired: true,
        rpaMinPeople: 1,
    };
    const hours = {
        id: "svc-hora",
        venueId: "venue-1",
        name: "Som",
        price: 40,
        pricingType: "PER_HOUR" as const,
        rpaRequired: false,
        rpaMinPeople: null,
    };

    const proposal = {
        id: "proposal-1",
        venueId: "venue-1",
        approved: false,
        paid: false,
        guestNumber: 10,
        startDate: new Date("2026-11-20T22:00:00.000Z"),
        endDate: new Date("2026-11-21T03:00:00.000Z"),
        totalAmount: 1000,
        proposalServices: [{
            id: "line-bar",
            serviceId: "svc-bar",
            amount: 300,
            unitPrice: 300,
            quantity: 1,
            pricingType: "FIXED" as const,
            service: { name: "Bar", rpaRequired: false, rpaMinPeople: null },
        }],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        proposalRepository.getById.mockResolvedValue(proposal);
        serviceRepository.getByVenueId.mockResolvedValue([optional, cleanup, hours]);
    });

    function run(serviceIds: string[], serviceHours?: { serviceId: string; hours: number }[]) {
        return useCase.execute({ proposalId: "proposal-1", serviceIds, serviceHours });
    }

    it("tira o opcional e o total cai o amount dessa linha, sem mexer na locacao", async () => {
        proposalRepository.getById
            .mockResolvedValueOnce(proposal)
            .mockResolvedValueOnce({
                ...proposal,
                totalAmount: 750,
                proposalServices: [{
                    id: "line-limpeza",
                    serviceId: "svc-limpeza",
                    amount: 50,
                    service: { name: "Limpeza", rpaRequired: true, rpaMinPeople: 1 },
                }],
            });

        const response = await run([]);

        expect(response.data.totalAmount).toBe(750);
        expect(proposalRepository.update).toHaveBeenCalledTimes(1);
        const written = proposalRepository.update.mock.calls[0][0].data;
        expect(written.totalAmount).toBe(750);
        expect(written.serviceLines).toEqual([{
            serviceId: "svc-limpeza",
            pricingType: "FIXED",
            unitPrice: 50,
            quantity: 1,
            amount: 50,
        }]);
        expect(written).not.toHaveProperty("basePrice");
        expect(written).not.toHaveProperty("extraHoursQty");
        expect(written).not.toHaveProperty("extraHourPrice");
        expect(written).not.toHaveProperty("startDate");
        expect(written).not.toHaveProperty("endDate");
        expect(written).not.toHaveProperty("guestNumber");
        expect(historyRepository.create).toHaveBeenCalledWith({
            proposalId: "proposal-1",
            action: HISTORY_ACTION,
        });
    });

    it("recoloca o obrigatorio omitido e entra na soma", async () => {
        await run(["svc-bar"]);

        const written = proposalRepository.update.mock.calls[0][0].data;
        expect(written.serviceIds).toEqual(["svc-bar", "svc-limpeza"]);
        expect(written.serviceLines).toEqual([
            {
                serviceId: "svc-bar",
                pricingType: "FIXED",
                unitPrice: 300,
                quantity: 1,
                amount: 300,
            },
            {
                serviceId: "svc-limpeza",
                pricingType: "FIXED",
                unitPrice: 50,
                quantity: 1,
                amount: 50,
            },
        ]);
        expect(written.totalAmount).toBe(1050);
    });

    it("nao grava servico de outro espaco", async () => {
        await expect(run(["svc-outro"])).rejects.toBeInstanceOf(HttpBadRequestError);
        expect(proposalRepository.update).not.toHaveBeenCalled();
        expect(historyRepository.create).not.toHaveBeenCalled();
    });

    it("nao grava nem historico quando a selecao e a mesma", async () => {
        proposalRepository.getById.mockResolvedValue({
            ...proposal,
            proposalServices: [
                proposal.proposalServices[0],
                {
                    id: "line-limpeza",
                    serviceId: "svc-limpeza",
                    amount: 50,
                    unitPrice: 50,
                    quantity: 1,
                    pricingType: "FIXED",
                    service: { name: "Limpeza", rpaRequired: true, rpaMinPeople: 1 },
                },
            ],
        });

        const response = await run(["svc-limpeza", "svc-bar", "svc-bar"]);

        expect(response.data.totalAmount).toBe(1000);
        expect(proposalRepository.update).not.toHaveBeenCalled();
        expect(historyRepository.create).not.toHaveBeenCalled();
    });

    it("5 horas num evento de 4 nao grava", async () => {
        proposalRepository.getById.mockResolvedValue({
            ...proposal,
            startDate: new Date("2026-11-20T18:00:00.000Z"),
            endDate: new Date("2026-11-20T22:00:00.000Z"),
        });

        await expect(run(["svc-bar", "svc-hora"], [{ serviceId: "svc-hora", hours: 5 }]))
            .rejects.toThrow("O serviço não pode ter mais horas do que o evento (4 horas).");
        expect(proposalRepository.update).not.toHaveBeenCalled();
    });

    it("4 horas num evento de 4 grava", async () => {
        proposalRepository.getById.mockResolvedValue({
            ...proposal,
            startDate: new Date("2026-11-20T18:00:00.000Z"),
            endDate: new Date("2026-11-20T22:00:00.000Z"),
        });

        await run(["svc-bar", "svc-hora"], [{ serviceId: "svc-hora", hours: 4 }]);

        const written = proposalRepository.update.mock.calls[0][0].data;
        expect(written.serviceLines).toContainEqual(expect.objectContaining({
            serviceId: "svc-hora",
            quantity: 4,
            amount: 160,
        }));
    });

    it("servico novo por hora sem horas nao grava", async () => {
        await expect(run(["svc-bar", "svc-hora"])).rejects.toBeInstanceOf(HttpBadRequestError);
        expect(proposalRepository.update).not.toHaveBeenCalled();
    });

    it("servico novo por hora grava a quantidade informada", async () => {
        await run(["svc-bar", "svc-hora"], [{ serviceId: "svc-hora", hours: 3 }]);

        const written = proposalRepository.update.mock.calls[0][0].data;
        expect(written.serviceLines).toContainEqual({
            serviceId: "svc-hora",
            pricingType: "PER_HOUR",
            unitPrice: 40,
            quantity: 3,
            amount: 120,
        });
        expect(written.totalAmount).toBe(1170);
        expect(written).not.toHaveProperty("startDate");
    });

    it("mudar so as horas conserva o unitario gravado", async () => {
        proposalRepository.getById.mockResolvedValue({
            ...proposal,
            proposalServices: [
                proposal.proposalServices[0],
                {
                    id: "line-hora",
                    serviceId: "svc-hora",
                    amount: 200,
                    unitPrice: 25,
                    quantity: 5,
                    pricingType: "PER_HOUR",
                    service: { name: "Som", rpaRequired: false, rpaMinPeople: null },
                },
            ],
        });

        await run(["svc-bar", "svc-hora"], [{ serviceId: "svc-hora", hours: 3 }]);

        const written = proposalRepository.update.mock.calls[0][0].data;
        expect(written.serviceLines).toContainEqual(expect.objectContaining({
            serviceId: "svc-hora",
            unitPrice: 25,
            quantity: 3,
            amount: 75,
        }));
    });

    it("as mesmas horas nao gravam de novo", async () => {
        proposalRepository.getById.mockResolvedValue({
            ...proposal,
            totalAmount: 1170,
            proposalServices: [
                proposal.proposalServices[0],
                {
                    id: "line-limpeza",
                    serviceId: "svc-limpeza",
                    amount: 50,
                    unitPrice: 50,
                    quantity: 1,
                    pricingType: "FIXED",
                    service: { name: "Limpeza", rpaRequired: true, rpaMinPeople: 1 },
                },
                {
                    id: "line-hora",
                    serviceId: "svc-hora",
                    amount: 120,
                    unitPrice: 40,
                    quantity: 3,
                    pricingType: "PER_HOUR",
                    service: { name: "Som", rpaRequired: false, rpaMinPeople: null },
                },
            ],
        });

        await run(["svc-bar", "svc-hora"], [{ serviceId: "svc-hora", hours: 3 }]);

        expect(proposalRepository.update).not.toHaveBeenCalled();
        expect(historyRepository.create).not.toHaveBeenCalled();
    });

    it("a leitura diz quais servicos pedem horas", async () => {
        proposalRepository.getById.mockResolvedValue({
            ...proposal,
            proposalServices: [{
                id: "line-hora",
                serviceId: "svc-hora",
                amount: 120,
                unitPrice: 40,
                quantity: 3,
                pricingType: "PER_HOUR",
                service: { name: "Som", rpaRequired: false, rpaMinPeople: null },
            }],
        });

        const listed = await useCase.list("proposal-1");
        const serialized = JSON.stringify(listed);
        expect(serialized).not.toContain("pricingType");
        expect(serialized).not.toContain("unitPrice");
        expect(listed.data.services).toContainEqual(expect.objectContaining({
            id: "svc-hora",
            hourly: true,
            hours: 3,
            selected: true,
        }));
        expect(listed.data.services).toContainEqual(expect.objectContaining({
            id: "svc-bar",
            hourly: false,
            hours: null,
            selected: false,
        }));
        serviceRepository.getByVenueId.mockResolvedValue([
            optional,
            { ...hours, id: "svc-led", name: "Led" },
        ]);
        const pending = await useCase.list("proposal-1");
        expect(pending.data.services).toContainEqual(expect.objectContaining({
            id: "svc-led",
            hourly: true,
            hours: null,
            selected: false,
        }));
    });

    it("a leitura ordena custo fixo, por hora e por pessoa", async () => {
        const person = {
            ...optional,
            id: "svc-pessoa",
            name: "Seguranca",
            price: 15,
            pricingType: "PER_PERSON" as const,
        };
        serviceRepository.getByVenueId.mockResolvedValue([person, hours, optional, cleanup]);

        const listed = await useCase.list("proposal-1");

        expect(listed.data.services.map((service) => service.id)).toEqual([
            "svc-bar",
            "svc-limpeza",
            "svc-hora",
            "svc-pessoa",
        ]);
        const serialized = JSON.stringify(listed);
        expect(serialized).not.toContain("pricingType");
        expect(serialized).not.toContain("unitPrice");
    });

    it("linha antiga sem amount sai pelo preco atual e nao deixa resto no total", async () => {
        proposalRepository.getById.mockResolvedValue({
            ...proposal,
            proposalServices: [{
                id: "line-bar",
                serviceId: "svc-bar",
                amount: null,
                service: { name: "Bar", rpaRequired: false, rpaMinPeople: null },
            }],
        });

        await run([]);

        const written = proposalRepository.update.mock.calls[0][0].data;
        expect(written.totalAmount).toBe(970);
        expect(written.serviceLines.map((line: { serviceId: string }) => line.serviceId)).toEqual(["svc-limpeza"]);
    });

    it("orcamento aprovado nao grava", async () => {
        proposalRepository.getById.mockResolvedValue({ ...proposal, approved: true });

        await expect(run([])).rejects.toThrow("Este orçamento já foi confirmado e não pode ser alterado.");
        expect(proposalRepository.update).not.toHaveBeenCalled();
    });

    it("deixa sair servico obrigatorio cujo minimo ainda nao foi atingido", async () => {
        serviceRepository.getByVenueId.mockResolvedValue([
            { ...cleanup, rpaMinPeople: 30 },
            { ...optional, rpaRequired: true, rpaMinPeople: null },
        ]);
        proposalRepository.getById.mockResolvedValue({
            ...proposal,
            proposalServices: [{
                id: "line-limpeza",
                serviceId: "svc-limpeza",
                amount: 50,
                unitPrice: 50,
                quantity: 1,
                pricingType: "FIXED",
                service: { name: "Limpeza", rpaRequired: true, rpaMinPeople: 30 },
            }],
        });

        await run([]);

        const written = proposalRepository.update.mock.calls[0][0].data;
        expect(written.serviceIds).toEqual([]);
        expect(written.totalAmount).toBe(950);
    });
});
