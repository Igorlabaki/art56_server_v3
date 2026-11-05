import { SeasonalFee } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { SERVICE_HOURS_MESSAGE, serviceHoursOverEventMessage } from "../../../functions/quote-service-lines";
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
        update: vi.fn(async (param: { proposalId: string; data: { totalAmount: number; serviceLines?: unknown[] } }) => ({
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
        listForQuote: vi.fn(async (): Promise<Array<{ id: string; venueId: string; price: number; pricingType: string }>> => []),
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
        serviceRepository.listForQuote.mockResolvedValue([]);
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

    it("grava a linha por pessoa e regrava a quantidade quando os convidados mudam", async () => {
        venueRepository.getById.mockResolvedValue({
            id: "venue-1",
            pricingModel: "PER_PERSON",
            pricePerPerson: 100,
            standardEventDuration: 6,
            minimumPrice: null,
            seasonalFee: [],
        });
        serviceRepository.listForQuote.mockResolvedValue([{
            id: "open-bar",
            venueId: "venue-1",
            price: 40,
            pricingType: "PER_PERSON",
        }]);

        await run({ serviceIds: ["open-bar"], totalAmountInput: "1" });
        serviceRepository.listForQuote.mockResolvedValue([{
            id: "open-bar",
            venueId: "venue-1",
            price: 99,
            pricingType: "PER_PERSON",
        }]);
        const stored = proposalRepository.update.mock.calls.at(-1)?.[0].data.serviceLines;
        expect(stored).toEqual([{
            serviceId: "open-bar",
            pricingType: "PER_PERSON",
            unitPrice: 40,
            quantity: 10,
            amount: 400,
        }]);

        await run({ serviceIds: ["open-bar"], guestNumber: "12", totalAmountInput: "1" });
        expect(proposalRepository.update.mock.calls.at(-1)?.[0].data.serviceLines[0]).toMatchObject({
            serviceId: "open-bar",
            quantity: 12,
            unitPrice: 99,
            amount: 1188,
        });
    });

    function hourlyVenue() {
        venueRepository.getById.mockResolvedValue({
            id: "venue-1",
            pricingModel: "PER_PERSON",
            pricePerPerson: 100,
            standardEventDuration: 6,
            minimumPrice: null,
            seasonalFee: [],
        });
    }

    it("grava a quantidade escolhida do servico por hora", async () => {
        hourlyVenue();
        serviceRepository.listForQuote.mockResolvedValue([{
            id: "led",
            venueId: "venue-1",
            price: 250,
            pricingType: "PER_HOUR",
        }]);

        await run({
            serviceIds: ["led"],
            serviceHours: [{ serviceId: "led", hours: 3 }],
            totalAmountInput: "1",
        });

        expect(proposalRepository.update.mock.calls.at(-1)?.[0].data.serviceLines).toEqual([{
            serviceId: "led",
            pricingType: "PER_HOUR",
            unitPrice: 250,
            quantity: 3,
            amount: 750,
        }]);
    });

    it("permuta grava a quantidade escolhida e mantem o total zero", async () => {
        hourlyVenue();
        serviceRepository.listForQuote.mockResolvedValue([{
            id: "led",
            venueId: "venue-1",
            price: 250,
            pricingType: "PER_HOUR",
        }]);

        const response = await run({
            type: "BARTER",
            serviceIds: ["led"],
            serviceHours: [{ serviceId: "led", hours: 3 }],
        });

        expect(response.data.totalAmount).toBe(0);
        expect(proposalRepository.update.mock.calls.at(-1)?.[0].data.serviceLines).toEqual([
            expect.objectContaining({ serviceId: "led", quantity: 3, amount: 750 }),
        ]);
    });

    it("recusa servico por hora sem horas, com zero ou acima da duracao", async () => {
        hourlyVenue();
        serviceRepository.listForQuote.mockResolvedValue([{
            id: "led",
            venueId: "venue-1",
            price: 250,
            pricingType: "PER_HOUR",
        }]);

        await expect(run({ serviceIds: ["led"] })).rejects.toBeInstanceOf(HttpBadRequestError);
        await expect(run({
            serviceIds: ["led"],
            serviceHours: [{ serviceId: "led", hours: 0 }],
        })).rejects.toThrow(SERVICE_HOURS_MESSAGE);
        await expect(run({
            serviceIds: ["led"],
            serviceHours: [{ serviceId: "led", hours: 1.5 as never }],
        })).rejects.toThrow(SERVICE_HOURS_MESSAGE);
        await expect(run({
            serviceIds: ["led"],
            serviceHours: [{ serviceId: "led", hours: 7 }],
        })).rejects.toThrow(serviceHoursOverEventMessage(6));
        expect(proposalRepository.update).not.toHaveBeenCalled();
    });

    it("grava zero quando o evento tambem tem duracao zero", async () => {
        hourlyVenue();
        serviceRepository.listForQuote.mockResolvedValue([{
            id: "led",
            venueId: "venue-1",
            price: 250,
            pricingType: "PER_HOUR",
        }]);

        await run({
            startHour: "10:00",
            endHour: "10:00",
            serviceIds: ["led"],
            serviceHours: [{ serviceId: "led", hours: 0 }],
            totalAmountInput: "1",
        });

        expect(proposalRepository.update.mock.calls.at(-1)?.[0].data.serviceLines[0]).toMatchObject({
            serviceId: "led",
            quantity: 0,
            amount: 0,
        });
    });

    it("servico fixo sem serviceHours grava quantidade 1", async () => {
        hourlyVenue();
        serviceRepository.listForQuote.mockResolvedValue([{
            id: "limpeza",
            venueId: "venue-1",
            price: 300,
            pricingType: "FIXED",
        }]);

        await run({ serviceIds: ["limpeza"], totalAmountInput: "1" });

        expect(proposalRepository.update.mock.calls.at(-1)?.[0].data.serviceLines).toEqual([{
            serviceId: "limpeza",
            pricingType: "FIXED",
            unitPrice: 300,
            quantity: 1,
            amount: 300,
        }]);
    });
});
