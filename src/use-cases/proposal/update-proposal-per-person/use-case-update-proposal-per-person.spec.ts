import { SeasonalFee } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UpdateProposalPerPersonUseCase } from "./use-case-update-proposal-per-person";
import { UpdateProposalPerPersonRequestParams } from "../../../zod/proposal/update-proposal-per-person-params-schema";

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

describe("UpdateProposalPerPersonUseCase", () => {
    const proposalRepository = {
        getById: vi.fn(),
        update: vi.fn(async (param: { proposalId: string; data: { totalAmount: number } }) => ({
            id: param.proposalId,
            totalAmount: param.data.totalAmount,
        })),
        updateServices: vi.fn(),
        monthlyRevenueAnalysis: vi.fn(async () => null as number | null),
    };
    const goalRepository = {
        findByVenueAndRevenue: vi.fn(),
    };
    const venueRepository = {
        getById: vi.fn(),
    };
    const serviceRepository = {
        getByProposalServiceListTotalAmount: vi.fn(async () => 0),
    };

    const useCase = new UpdateProposalPerPersonUseCase(
        { getById: vi.fn() } as never,
        venueRepository as never,
        serviceRepository as never,
        { create: vi.fn() } as never,
        proposalRepository as never,
        goalRepository as never,
    );

    const baseData = {
        completeClientName: "Cliente",
        date: "15/01/2026",
        venueId: "venue-1",
        endHour: "16:00",
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
        proposalRepository.monthlyRevenueAnalysis.mockResolvedValue(null);
        serviceRepository.getByProposalServiceListTotalAmount.mockResolvedValue(0);
    });

    function run(data: Partial<UpdateProposalPerPersonRequestParams["data"]> = {}) {
        return useCase.execute({
            proposalId: "proposal-1",
            data: { ...baseData, ...data },
        });
    }

    it("recalcula o total com adicional e desconto quando o valor nao foi digitado", async () => {
        venueRepository.getById.mockResolvedValue({
            id: "venue-1",
            pricingModel: "PER_PERSON",
            pricePerPerson: 100,
            standardEventDuration: 6,
            minimumPrice: null,
            seasonalFee: [
                fee({ type: "SURCHARGE", fee: 20 }),
                fee({ id: "fee-2", type: "DISCOUNT", fee: 10 }),
            ],
        });

        const response = await run();

        expect(response.data.totalAmount).toBe(1100);
    });

    it("aplica o aumento de meta depois dos adicionais e descontos", async () => {
        proposalRepository.monthlyRevenueAnalysis.mockResolvedValue(8000);
        goalRepository.findByVenueAndRevenue.mockResolvedValue({ increasePercent: 10 });
        venueRepository.getById.mockResolvedValue({
            id: "venue-1",
            pricingModel: "PER_PERSON",
            pricePerPerson: 100,
            standardEventDuration: 6,
            minimumPrice: null,
            seasonalFee: [fee({ type: "SURCHARGE", fee: 10 })],
        });

        const response = await run();

        expect(response.data.totalAmount).toBe(1210);
    });

    it("grava o total digitado sem aplicar percentual por cima", async () => {
        proposalRepository.getById.mockResolvedValue({ id: "proposal-1", totalAmount: 1100 });
        venueRepository.getById.mockResolvedValue({
            id: "venue-1",
            pricingModel: "PER_PERSON",
            pricePerPerson: 100,
            standardEventDuration: 6,
            minimumPrice: null,
            seasonalFee: [fee({ type: "SURCHARGE", fee: 50 })],
        });

        const response = await run({ totalAmountInput: "2500" });

        expect(response.data.totalAmount).toBe(2500);
    });

    it("mantem permuta com total zero", async () => {
        venueRepository.getById.mockResolvedValue({
            id: "venue-1",
            pricingModel: "PER_PERSON",
            pricePerPerson: 100,
            seasonalFee: [fee({ type: "SURCHARGE", fee: 50 })],
        });

        const response = await run({ type: "BARTER" });

        expect(response.data.totalAmount).toBe(0);
    });
});
