import { describe, expect, it, vi } from "vitest";
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { SERVICE_HOURS_MESSAGE } from "../../../functions/quote-service-lines";
import { EVENT_CATEGORY_MESSAGE } from "../../../functions/event-category";
import { CreateProposalPerDayUseCase } from "./use-case-create-proposal-per-day";
import { updateProposalPerDayRequestParams } from "../../../zod/proposal/update-proposal-per-day--params-schema";

const venue = { id: "venue-1", organizationId: "org-1" };
const saved = {
    id: "proposal-1",
    completeClientName: "Ana",
    startDate: new Date("2026-06-01T18:00:00.000Z"),
    endDate: new Date("2026-06-02T18:00:00.000Z"),
};

function build(services: Array<{ id: string; venueId: string; price: number; pricingType: "FIXED" | "PER_HOUR" | "PER_PERSON" }>) {
    const proposalRepository = { createPerDay: vi.fn(async () => saved) };
    const useCase = new CreateProposalPerDayUseCase(
        { getById: vi.fn() } as never,
        {} as never,
        { getById: vi.fn(async () => venue) } as never,
        { getUserVenuePermission: vi.fn(async () => null) } as never,
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
    endDay: "2026-06-01",
    startDay: "2026-06-01",
    whatsapp: "11999999999",
    startHour: "18:00",
    guestNumber: "10",
    description: "Festa",
    knowsVenue: false,
    type: "BARTER" as const,
    trafficSource: "OTHER" as const,
};

describe("categoria do evento na criacao por dia", () => {
    it("permuta grava categoria nula mesmo recebendo uma", async () => {
        const { useCase, proposalRepository } = build([]);
        await useCase.execute({ ...base, serviceIds: [], eventCategory: "BIRTHDAY" });
        expect(proposalRepository.createPerDay).toHaveBeenCalledWith(expect.objectContaining({ eventCategory: null }));
    });

    it("evento sem categoria nao grava", async () => {
        const { useCase, proposalRepository } = build([]);
        await expect(useCase.execute({ ...base, type: "EVENT", serviceIds: [] })).rejects.toThrow(EVENT_CATEGORY_MESSAGE);
        expect(proposalRepository.createPerDay).not.toHaveBeenCalled();
    });
});

describe("horas na criacao por dia", () => {
    it("servico por hora com 3 horas grava quantidade 3", async () => {
        const { useCase, proposalRepository } = build([
            { id: "led", venueId: "venue-1", price: 250, pricingType: "PER_HOUR" },
        ]);
        await useCase.execute({
            ...base,
            serviceIds: ["led"],
            serviceHours: [{ serviceId: "led", hours: 3 }],
        });
        expect(proposalRepository.createPerDay).toHaveBeenCalledWith(expect.objectContaining({
            serviceLines: [expect.objectContaining({ serviceId: "led", quantity: 3, amount: 750 })],
        }));
        expect(proposalRepository.createPerDay.mock.calls[0][0]).not.toHaveProperty("serviceHours");
    });

    it("servico por hora sem horas nao grava", async () => {
        const { useCase, proposalRepository } = build([
            { id: "led", venueId: "venue-1", price: 250, pricingType: "PER_HOUR" },
        ]);
        await expect(useCase.execute({ ...base, serviceIds: ["led"] })).rejects.toBeInstanceOf(HttpBadRequestError);
        expect(proposalRepository.createPerDay).not.toHaveBeenCalled();
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
        expect(proposalRepository.createPerDay).not.toHaveBeenCalled();
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
        expect(proposalRepository.createPerDay).toHaveBeenCalledWith(expect.objectContaining({
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
        expect(proposalRepository.createPerDay).not.toHaveBeenCalled();
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
        expect(proposalRepository.createPerDay).toHaveBeenCalledWith(expect.objectContaining({
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
        expect(proposalRepository.createPerDay).not.toHaveBeenCalled();
    });

    it("fixo sem serviceHours continua gravando", async () => {
        const { useCase, proposalRepository } = build([
            { id: "limpeza", venueId: "venue-1", price: 300, pricingType: "FIXED" },
        ]);
        await useCase.execute({ ...base, serviceIds: ["limpeza"] });
        expect(proposalRepository.createPerDay).toHaveBeenCalledWith(expect.objectContaining({
            serviceLines: [expect.objectContaining({ serviceId: "limpeza", quantity: 1, amount: 300 })],
        }));
    });

    it("a edicao por dia conserva serviceHours", () => {
        const parsed = updateProposalPerDayRequestParams.parse({
            proposalId: "proposal-1",
            data: {
                ...base,
                totalAmountInput: "0",
                serviceIds: ["led"],
                serviceHours: [{ serviceId: "led", hours: 3 }],
            },
        });
        expect(parsed.data.serviceHours).toEqual([{ serviceId: "led", hours: 3 }]);
    });

    it("a edicao por dia recusa hora fracionada", () => {
        const parsed = updateProposalPerDayRequestParams.safeParse({
            proposalId: "proposal-1",
            data: {
                ...base,
                totalAmountInput: "0",
                serviceIds: ["led"],
                serviceHours: [{ serviceId: "led", hours: 1.5 }],
            },
        });
        expect(parsed.success).toBe(false);
    });
});
