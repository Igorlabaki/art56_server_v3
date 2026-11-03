import { SeasonalFee } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
        update: vi.fn(async (param: { proposalId: string; data: { totalAmount: number } }) => ({
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
        getByProposalServiceListTotalAmount: vi.fn(async () => 0),
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
        trafficSource: "OTHER" as const,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        proposalRepository.getById.mockResolvedValue({ id: "proposal-1", totalAmount: 1 });
        serviceRepository.getByProposalServiceListTotalAmount.mockResolvedValue(0);
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
});
