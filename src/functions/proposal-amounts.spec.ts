import { describe, expect, it, vi } from "vitest";
import { adjustVenueUnitPrice, calcProposalAmounts, VenueForAmounts } from "./proposal-amounts";

const start = new Date("2026-11-20T14:00:00.000Z");
const hoursAfter = (hours: number) => new Date(start.getTime() + hours * 60 * 60 * 1000);

function venue(partial: Partial<VenueForAmounts>): VenueForAmounts {
    return {
        id: "venue-1",
        pricingModel: "PER_PERSON",
        pricePerPerson: 100,
        standardEventDuration: 4,
        minimumPrice: null,
        minimumPricePeriods: [],
        seasonalFee: [],
        ...partial,
    };
}

function repositories(monthlyRevenue: number | null, increasePercent?: number) {
    return {
        proposalRepository: { monthlyRevenueAnalysis: vi.fn(async () => monthlyRevenue) },
        goalRepository: {
            findByVenueAndRevenue: vi.fn(async () => (increasePercent ? ({ increasePercent } as never) : null)),
        },
    };
}

describe("calcProposalAmounts", () => {
    it("PER_PERSON lanca hora extra so acima da duracao padrao e soma servicos", () => {
        const amounts = calcProposalAmounts({
            venue: venue({}),
            unitPrice: 100,
            hasMonthlyRevenue: false,
            startDate: start,
            endDate: hoursAfter(6),
            guestNumber: 10,
            services: 50,
        });

        expect(amounts).toEqual({
            basePrice: 1000,
            extraHoursQty: 2,
            extraHourPrice: 167,
            totalAmount: 1384,
            minimumApplied: false,
        });
    });

    it("PER_PERSON_HOUR cobra pela duracao sem receita e como por pessoa com receita", () => {
        const base = {
            venue: venue({ pricingModel: "PER_PERSON_HOUR", pricePerPerson: null, pricePerPersonHour: 10, standardEventDuration: 6 }),
            unitPrice: 10,
            startDate: start,
            endDate: hoursAfter(8),
            guestNumber: 4,
            services: 0,
        };

        expect(calcProposalAmounts({ ...base, hasMonthlyRevenue: false })).toEqual({
            basePrice: 320,
            extraHoursQty: 0,
            extraHourPrice: 40,
            totalAmount: 320,
            minimumApplied: false,
        });
        expect(calcProposalAmounts({ ...base, hasMonthlyRevenue: true })).toEqual({
            basePrice: 40,
            extraHoursQty: 2,
            extraHourPrice: 7,
            totalAmount: 54,
            minimumApplied: false,
        });
    });

    it("troca a locacao pelo minimo, tira horas extras e marca minimumApplied", () => {
        const amounts = calcProposalAmounts({
            venue: venue({ pricePerPerson: 10, minimumPrice: 5000 }),
            unitPrice: 10,
            hasMonthlyRevenue: false,
            startDate: start,
            endDate: hoursAfter(8),
            guestNumber: 2,
            services: 100,
        });

        expect(amounts).toEqual({
            basePrice: 5000,
            extraHoursQty: 0,
            extraHourPrice: 0,
            totalAmount: 5100,
            minimumApplied: true,
        });
    });

    it("devolve null sem conta para o modelo", () => {
        const base = { unitPrice: 10, hasMonthlyRevenue: false, startDate: start, endDate: hoursAfter(4), guestNumber: 2, services: 0 };

        expect(calcProposalAmounts({ ...base, venue: venue({ pricingModel: "TIERED" }) })).toBeNull();
        expect(calcProposalAmounts({ ...base, venue: venue({ pricePerPerson: 0 }) })).toBeNull();
    });
});

describe("adjustVenueUnitPrice", () => {
    it("aplica temporada que vira o ano a evento em janeiro", async () => {
        const repos = repositories(null);
        const adjusted = await adjustVenueUnitPrice(
            venue({
                seasonalFee: [{
                    id: "fee-1",
                    venueId: "venue-1",
                    type: "SURCHARGE",
                    fee: 10,
                    startDay: "15/12",
                    endDay: "15/01",
                    affectedDays: null,
                } as never],
            }),
            new Date("2027-01-10T14:00:00.000Z"),
            repos,
        );

        expect(adjusted).toEqual({ unitPrice: 110, hasMonthlyRevenue: false });
    });

    it("so aplica a meta quando ha receita no mes", async () => {
        const withoutRevenue = repositories(null, 20);
        expect(await adjustVenueUnitPrice(venue({}), start, withoutRevenue)).toEqual({ unitPrice: 100, hasMonthlyRevenue: false });
        expect(withoutRevenue.goalRepository.findByVenueAndRevenue).not.toHaveBeenCalled();

        const withRevenue = repositories(5000, 20);
        expect(await adjustVenueUnitPrice(venue({}), start, withRevenue)).toEqual({ unitPrice: 120, hasMonthlyRevenue: true });
        expect(withRevenue.proposalRepository.monthlyRevenueAnalysis).toHaveBeenCalledWith({
            venueId: "venue-1",
            year: 2026,
            month: 11,
            approved: true,
        });
    });

    it("devolve null sem preco do modelo e nao consulta o banco", async () => {
        const repos = repositories(5000, 20);

        expect(await adjustVenueUnitPrice(venue({ pricingModel: "TIERED" }), start, repos)).toBeNull();
        expect(await adjustVenueUnitPrice(venue({ pricePerPerson: null }), start, repos)).toBeNull();
        expect(repos.proposalRepository.monthlyRevenueAnalysis).not.toHaveBeenCalled();
    });
});
