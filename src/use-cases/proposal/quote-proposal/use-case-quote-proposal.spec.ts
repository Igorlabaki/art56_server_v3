import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { NO_QUOTE_MESSAGE, QuoteProposalUseCase } from "./use-case-quote-proposal";

describe("QuoteProposalUseCase", () => {
    const venue = {
        id: "venue-1",
        pricingModel: "PER_PERSON",
        pricePerPerson: 100,
        standardEventDuration: 4,
        minimumPrice: null,
        minimumPricePeriods: [],
        seasonalFee: [],
    };
    const authorizer = { assert: vi.fn() };
    const serviceRepository = { listForQuote: vi.fn() };
    const proposalRepository = { monthlyRevenueAnalysis: vi.fn() };
    const goalRepository = { findByVenueAndRevenue: vi.fn() };
    const useCase = new QuoteProposalUseCase(
        authorizer as never,
        serviceRepository as never,
        proposalRepository as never,
        goalRepository as never,
    );

    beforeEach(() => {
        vi.clearAllMocks();
        authorizer.assert.mockResolvedValue(venue);
        serviceRepository.listForQuote.mockResolvedValue([]);
        proposalRepository.monthlyRevenueAnalysis.mockResolvedValue(null);
    });

    function run(partial: Record<string, unknown> = {}) {
        return useCase.execute({
            userId: "user-1",
            venueId: "venue-1",
            date: "2026-11-20",
            startHour: "18:00",
            endHour: "22:00",
            guestNumber: 10,
            serviceIds: [],
            serviceHours: [],
            type: "EVENT",
            ...partial,
        } as never);
    }

    it("autoriza o usuario no espaco antes de calcular", async () => {
        await run();

        expect(authorizer.assert).toHaveBeenCalledWith("user-1", "venue-1");
    });

    it("soma servicos fixo, por pessoa e por hora no total", async () => {
        serviceRepository.listForQuote.mockResolvedValue([
            { id: "fixo", venueId: "venue-1", price: 300, pricingType: "FIXED" },
            { id: "pessoa", venueId: "venue-1", price: 10, pricingType: "PER_PERSON" },
            { id: "hora", venueId: "venue-1", price: 50, pricingType: "PER_HOUR" },
        ]);

        const response = await run({
            serviceIds: ["fixo", "pessoa", "hora"],
            serviceHours: [{ serviceId: "hora", hours: 2 }],
        });

        expect(response.data).toEqual({
            basePrice: 1000,
            extraHoursQty: 0,
            extraHourPrice: 167,
            totalAmountService: 500,
            totalAmount: 1500,
            minimumApplied: false,
        });
    });

    it("permuta devolve zeros sem ler servicos nem meta", async () => {
        const response = await run({ type: "BARTER" });

        expect(response.data).toEqual({
            basePrice: 0,
            extraHoursQty: 0,
            extraHourPrice: 0,
            totalAmountService: 0,
            totalAmount: 0,
            minimumApplied: false,
        });
        expect(serviceRepository.listForQuote).not.toHaveBeenCalled();
        expect(proposalRepository.monthlyRevenueAnalysis).not.toHaveBeenCalled();
    });

    it("recusa modelo sem conta por pessoa", async () => {
        const models = [
            { pricingModel: "PER_DAY", pricePerDay: 1000 },
            { pricingModel: "TIERED" },
            { pricingModel: "PER_PERSON", pricePerPerson: null },
        ];

        for (const model of models) {
            authorizer.assert.mockResolvedValue({ ...venue, ...model });
            await expect(run()).rejects.toThrow(NO_QUOTE_MESSAGE);
        }
    });

    it("recusa servico por hora sem horas e servico de outro espaco", async () => {
        serviceRepository.listForQuote.mockResolvedValue([
            { id: "hora", venueId: "venue-1", price: 50, pricingType: "PER_HOUR" },
        ]);
        await expect(run({ serviceIds: ["hora"] })).rejects.toBeInstanceOf(HttpBadRequestError);

        serviceRepository.listForQuote.mockResolvedValue([
            { id: "alheio", venueId: "venue-2", price: 50, pricingType: "FIXED" },
        ]);
        await expect(run({ serviceIds: ["alheio"] })).rejects.toBeInstanceOf(HttpBadRequestError);
    });

    it("cortesia de 2h reduz totalAmountService e totalAmount", async () => {
        serviceRepository.listForQuote.mockResolvedValue([
            { id: "hora", venueId: "venue-1", price: 50, pricingType: "PER_HOUR" },
        ]);
        const body = { serviceIds: ["hora"], serviceHours: [{ serviceId: "hora", hours: 4 }] };

        const plain = await run(body);
        const withCourtesy = await run({ ...body, serviceCourtesy: [{ serviceId: "hora", quantity: 2 }] });

        expect(plain.data.totalAmountService).toBe(200);
        expect(withCourtesy.data.totalAmountService).toBe(100);
        expect(plain.data.totalAmount - withCourtesy.data.totalAmount).toBe(100);
    });

    it("cortesia acima da quantidade e recusada", async () => {
        serviceRepository.listForQuote.mockResolvedValue([
            { id: "fixo", venueId: "venue-1", price: 300, pricingType: "FIXED" },
        ]);
        await expect(run({ serviceIds: ["fixo"], serviceCourtesy: [{ serviceId: "fixo", quantity: 2 }] }))
            .rejects.toBeInstanceOf(HttpBadRequestError);
    });

    it("nao recebe repositorio de escrita", () => {
        expect(Object.keys(proposalRepository)).toEqual(["monthlyRevenueAnalysis"]);
        expect(Object.keys(serviceRepository)).toEqual(["listForQuote"]);
    });
});
