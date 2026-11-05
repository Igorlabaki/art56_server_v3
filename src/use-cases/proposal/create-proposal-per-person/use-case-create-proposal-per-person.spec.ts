import { describe, expect, it, vi } from "vitest";
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { SERVICE_HOURS_MESSAGE } from "../../../functions/quote-service-lines";
import { CreateProposalPerPersonUseCase } from "./use-case-create-proposal-per-person";
import { updateProposalPerPersonRequestParams } from "../../../zod/proposal/update-proposal-per-person-params-schema";

const venue = { id: "venue-1", organizationId: "org-1" };
const saved = {
    id: "proposal-1",
    completeClientName: "Ana",
    startDate: new Date("2026-06-01T18:00:00.000Z"),
};

function build(services: Array<{ id: string; venueId: string; price: number; pricingType: "FIXED" | "PER_HOUR" | "PER_PERSON" }>) {
    const proposalRepository = { createPerPerson: vi.fn(async () => saved) };
    const useCase = new CreateProposalPerPersonUseCase(
        { getById: vi.fn() } as never,
        {} as never,
        { getById: vi.fn(async () => venue) } as never,
        { listForQuote: vi.fn(async () => services) } as never,
        { create: vi.fn() } as never,
        proposalRepository as never,
        { create: vi.fn() } as never,
    );
    return { useCase, proposalRepository };
}

const base = {
    completeClientName: "Ana",
    venueId: "venue-1",
    endHour: "22:00",
    whatsapp: "11999999999",
    startHour: "18:00",
    date: "2026-06-01",
    guestNumber: "10",
    description: "Festa",
    knowsVenue: false,
    type: "BARTER" as const,
    trafficSource: "OTHER" as const,
};

describe("horas na criacao por pessoa", () => {
    it("servico por hora com 3 horas grava quantidade 3", async () => {
        const { useCase, proposalRepository } = build([
            { id: "led", venueId: "venue-1", price: 250, pricingType: "PER_HOUR" },
        ]);
        await useCase.execute({
            ...base,
            serviceIds: ["led"],
            serviceHours: [{ serviceId: "led", hours: 3 }],
        });
        expect(proposalRepository.createPerPerson).toHaveBeenCalledWith(expect.objectContaining({
            serviceLines: [expect.objectContaining({ serviceId: "led", quantity: 3, amount: 750 })],
        }));
        expect(proposalRepository.createPerPerson.mock.calls[0][0]).not.toHaveProperty("serviceHours");
    });

    it("servico por hora sem horas nao grava", async () => {
        const { useCase, proposalRepository } = build([
            { id: "led", venueId: "venue-1", price: 250, pricingType: "PER_HOUR" },
        ]);
        await expect(useCase.execute({ ...base, serviceIds: ["led"] })).rejects.toBeInstanceOf(HttpBadRequestError);
        expect(proposalRepository.createPerPerson).not.toHaveBeenCalled();
    });

    it("zero com evento de 4 horas nao grava", async () => {
        const { useCase, proposalRepository } = build([
            { id: "led", venueId: "venue-1", price: 250, pricingType: "PER_HOUR" },
        ]);
        await expect(useCase.execute({
            ...base,
            serviceIds: ["led"],
            serviceHours: [{ serviceId: "led", hours: 0 }],
        })).rejects.toBeInstanceOf(HttpBadRequestError);
        expect(proposalRepository.createPerPerson).not.toHaveBeenCalled();
    });

    it("zero com inicio e fim iguais grava quantidade 0", async () => {
        const { useCase, proposalRepository } = build([
            { id: "led", venueId: "venue-1", price: 250, pricingType: "PER_HOUR" },
        ]);
        await useCase.execute({
            ...base,
            endHour: "18:00",
            serviceIds: ["led"],
            serviceHours: [{ serviceId: "led", hours: 0 }],
        });
        expect(proposalRepository.createPerPerson).toHaveBeenCalledWith(expect.objectContaining({
            serviceLines: [expect.objectContaining({ quantity: 0, amount: 0 })],
        }));
    });

    it("5 horas num evento de 4 nao grava", async () => {
        const { useCase, proposalRepository } = build([
            { id: "led", venueId: "venue-1", price: 250, pricingType: "PER_HOUR" },
        ]);
        await expect(useCase.execute({
            ...base,
            serviceIds: ["led"],
            serviceHours: [{ serviceId: "led", hours: 5 }],
        })).rejects.toThrow("O serviço não pode ter mais horas do que o evento (4 horas).");
        expect(proposalRepository.createPerPerson).not.toHaveBeenCalled();
    });

    it("4 horas num evento de 4 grava", async () => {
        const { useCase, proposalRepository } = build([
            { id: "led", venueId: "venue-1", price: 250, pricingType: "PER_HOUR" },
        ]);
        await useCase.execute({
            ...base,
            serviceIds: ["led"],
            serviceHours: [{ serviceId: "led", hours: 4 }],
        });
        expect(proposalRepository.createPerPerson).toHaveBeenCalledWith(expect.objectContaining({
            serviceLines: [expect.objectContaining({ quantity: 4, amount: 1000 })],
        }));
    });

    it("fracao continua na frase de inteiro", async () => {
        const { useCase, proposalRepository } = build([
            { id: "led", venueId: "venue-1", price: 250, pricingType: "PER_HOUR" },
        ]);
        await expect(useCase.execute({
            ...base,
            serviceIds: ["led"],
            serviceHours: [{ serviceId: "led", hours: 1.5 }],
        })).rejects.toThrow(SERVICE_HOURS_MESSAGE);
        expect(proposalRepository.createPerPerson).not.toHaveBeenCalled();
    });

    it("fixo sem serviceHours continua gravando", async () => {
        const { useCase, proposalRepository } = build([
            { id: "limpeza", venueId: "venue-1", price: 300, pricingType: "FIXED" },
        ]);
        await useCase.execute({ ...base, serviceIds: ["limpeza"] });
        expect(proposalRepository.createPerPerson).toHaveBeenCalledWith(expect.objectContaining({
            serviceLines: [expect.objectContaining({ serviceId: "limpeza", quantity: 1, amount: 300 })],
        }));
    });

    it("a edicao por pessoa nao recebe serviceHours", () => {
        const parsed = updateProposalPerPersonRequestParams.parse({
            proposalId: "proposal-1",
            data: {
                ...base,
                totalAmountInput: "0",
                serviceIds: ["led"],
                serviceHours: [{ serviceId: "led", hours: 3 }],
            },
        });
        expect(parsed.data).not.toHaveProperty("serviceHours");
    });
});
