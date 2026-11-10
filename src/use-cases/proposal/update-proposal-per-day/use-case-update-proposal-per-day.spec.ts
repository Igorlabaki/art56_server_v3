import { SeasonalFee } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { SERVICE_HOURS_MESSAGE, serviceHoursOverEventMessage } from "../../../functions/quote-service-lines";
import { UpdateProposalPerDayUseCase } from "./use-case-update-proposal-per-day";

function fee(partial: Partial<SeasonalFee> & Pick<SeasonalFee, "type" | "fee">): SeasonalFee {
    return {
        id: "fee-1",
        title: "ajuste",
        startDay: "01/01",
        endDay: "31/01",
        venueId: "venue-1",
        affectedDays: null,
        ...partial,
    };
}

describe("UpdateProposalPerDayUseCase", () => {
    const proposalRepository = {
        getById: vi.fn(),
        update: vi.fn(async (param: { proposalId: string; data: { totalAmount: number; serviceLines?: unknown[] } }) => ({
            id: param.proposalId,
            totalAmount: param.data.totalAmount,
        })),
        updateServices: vi.fn(),
        monthlyRevenueAnalysis: vi.fn(async () => null as number | null),
    };
    const venueRepository = {
        getById: vi.fn(),
    };
    const serviceRepository = {
        listForQuote: vi.fn(async (): Promise<Array<{ id: string; venueId: string; price: number; pricingType: string }>> => []),
    };

    const useCase = new UpdateProposalPerDayUseCase(
        { getById: vi.fn() } as never,
        venueRepository as never,
        serviceRepository as never,
        { create: vi.fn() } as never,
        proposalRepository as never,
        { findByVenueAndRevenue: vi.fn() } as never,
    );

    const baseData = {
        completeClientName: "Cliente",
        venueId: "venue-1",
        endHour: "18:00",
        endDay: "17/01/2026",
        startDay: "15/01/2026",
        whatsapp: "11999999999",
        startHour: "10:00",
        guestNumber: "10",
        description: "evento",
        knowsVenue: true,
        email: "cliente@email.com",
        totalAmountInput: "1",
        serviceIds: [] as string[],
        type: "EVENT" as const,
        eventCategory: "BIRTHDAY" as const,
        trafficSource: "OTHER" as const,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        proposalRepository.getById.mockResolvedValue({ id: "proposal-1", totalAmount: 1 });
        serviceRepository.listForQuote.mockResolvedValue([]);
    });

    it("recalcula diaria com adicional e desconto da data de inicio", async () => {
        venueRepository.getById.mockResolvedValue({
            id: "venue-1",
            pricingModel: "PER_DAY",
            pricePerDay: 100,
            minimumPrice: null,
            seasonalFee: [
                fee({ type: "SURCHARGE", fee: 20 }),
                fee({ id: "fee-2", type: "DISCOUNT", fee: 10 }),
            ],
        });

        const response = await useCase.execute({
            proposalId: "proposal-1",
            data: baseData,
        });

        expect(response.data.totalAmount).toBe(220);
    });

    it("grava o total digitado sem aplicar percentual por cima", async () => {
        proposalRepository.getById.mockResolvedValue({ id: "proposal-1", totalAmount: 220 });
        venueRepository.getById.mockResolvedValue({
            id: "venue-1",
            pricingModel: "PER_DAY",
            pricePerDay: 100,
            minimumPrice: null,
            seasonalFee: [fee({ type: "SURCHARGE", fee: 50 })],
        });

        const response = await useCase.execute({
            proposalId: "proposal-1",
            data: { ...baseData, totalAmountInput: "900" },
        });

        expect(response.data.totalAmount).toBe(900);
    });

    function stayVenue() {
        venueRepository.getById.mockResolvedValue({
            id: "venue-1",
            pricingModel: "PER_DAY",
            pricePerDay: 100,
            minimumPrice: null,
            seasonalFee: [],
        });
    }

    it("grava a quantidade escolhida do servico por hora, nao as diarias nem o intervalo", async () => {
        proposalRepository.getById.mockResolvedValue({ id: "proposal-1", totalAmount: 1 });
        stayVenue();
        serviceRepository.listForQuote.mockResolvedValue([{
            id: "dj",
            venueId: "venue-1",
            price: 10,
            pricingType: "PER_HOUR",
        }]);

        const response = await useCase.execute({
            proposalId: "proposal-1",
            data: {
                ...baseData,
                serviceIds: ["dj"],
                serviceHours: [{ serviceId: "dj", hours: 3 }],
                totalAmountInput: "1",
            },
        });

        expect(response.data.totalAmount).toBe(230);
        expect(proposalRepository.update.mock.calls.at(-1)?.[0].data.serviceLines).toEqual([{
            serviceId: "dj",
            pricingType: "PER_HOUR",
            unitPrice: 10,
            quantity: 3,
            amount: 30,
        }]);
    });

    it("permuta grava a quantidade escolhida", async () => {
        stayVenue();
        serviceRepository.listForQuote.mockResolvedValue([{
            id: "dj",
            venueId: "venue-1",
            price: 10,
            pricingType: "PER_HOUR",
        }]);

        const response = await useCase.execute({
            proposalId: "proposal-1",
            data: {
                ...baseData,
                type: "BARTER",
                serviceIds: ["dj"],
                serviceHours: [{ serviceId: "dj", hours: 3 }],
            },
        });

        expect(response.data.totalAmount).toBe(0);
        expect(proposalRepository.update.mock.calls.at(-1)?.[0].data.serviceLines).toEqual([
            expect.objectContaining({ serviceId: "dj", quantity: 3, amount: 30 }),
        ]);
    });

    it("recusa servico por hora sem horas, com zero, fracao ou acima da duracao", async () => {
        stayVenue();
        serviceRepository.listForQuote.mockResolvedValue([{
            id: "dj",
            venueId: "venue-1",
            price: 10,
            pricingType: "PER_HOUR",
        }]);

        await expect(useCase.execute({
            proposalId: "proposal-1",
            data: { ...baseData, serviceIds: ["dj"] },
        })).rejects.toBeInstanceOf(HttpBadRequestError);
        await expect(useCase.execute({
            proposalId: "proposal-1",
            data: { ...baseData, serviceIds: ["dj"], serviceHours: [{ serviceId: "dj", hours: 0 }] },
        })).rejects.toThrow(SERVICE_HOURS_MESSAGE);
        await expect(useCase.execute({
            proposalId: "proposal-1",
            data: { ...baseData, serviceIds: ["dj"], serviceHours: [{ serviceId: "dj", hours: 1.5 as never }] },
        })).rejects.toThrow(SERVICE_HOURS_MESSAGE);
        await expect(useCase.execute({
            proposalId: "proposal-1",
            data: { ...baseData, serviceIds: ["dj"], serviceHours: [{ serviceId: "dj", hours: 57 }] },
        })).rejects.toThrow(serviceHoursOverEventMessage(56));
        expect(proposalRepository.update).not.toHaveBeenCalled();
    });

    it("grava zero quando a estadia tambem tem duracao zero", async () => {
        proposalRepository.getById.mockResolvedValue({ id: "proposal-1", totalAmount: 1 });
        stayVenue();
        serviceRepository.listForQuote.mockResolvedValue([{
            id: "dj",
            venueId: "venue-1",
            price: 10,
            pricingType: "PER_HOUR",
        }]);

        await useCase.execute({
            proposalId: "proposal-1",
            data: {
                ...baseData,
                startDay: "15/01/2026",
                endDay: "15/01/2026",
                startHour: "10:00",
                endHour: "10:00",
                serviceIds: ["dj"],
                serviceHours: [{ serviceId: "dj", hours: 0 }],
                totalAmountInput: "1",
            },
        });

        expect(proposalRepository.update.mock.calls.at(-1)?.[0].data.serviceLines[0]).toMatchObject({
            serviceId: "dj",
            quantity: 0,
            amount: 0,
        });
    });

    it("servico fixo sem serviceHours grava quantidade 1", async () => {
        proposalRepository.getById.mockResolvedValue({ id: "proposal-1", totalAmount: 1 });
        stayVenue();
        serviceRepository.listForQuote.mockResolvedValue([{
            id: "limpeza",
            venueId: "venue-1",
            price: 300,
            pricingType: "FIXED",
        }]);

        await useCase.execute({
            proposalId: "proposal-1",
            data: { ...baseData, serviceIds: ["limpeza"], totalAmountInput: "1" },
        });

        expect(proposalRepository.update.mock.calls.at(-1)?.[0].data.serviceLines).toEqual([{
            serviceId: "limpeza",
            pricingType: "FIXED",
            unitPrice: 300,
            quantity: 1,
            amount: 300,
        }]);
    });
});
