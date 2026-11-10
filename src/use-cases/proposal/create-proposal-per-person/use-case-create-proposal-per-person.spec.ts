import { describe, expect, it, vi } from "vitest";
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { SERVICE_HOURS_MESSAGE } from "../../../functions/quote-service-lines";
import { EVENT_CATEGORY_MESSAGE } from "../../../functions/event-category";
import { CreateProposalPerPersonUseCase } from "./use-case-create-proposal-per-person";
import { QuoteProposalUseCase } from "../quote-proposal/use-case-quote-proposal";
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

    it("a edicao por pessoa conserva serviceHours", () => {
        const parsed = updateProposalPerPersonRequestParams.parse({
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

    it("a edicao por pessoa recusa hora fracionada", () => {
        const parsed = updateProposalPerPersonRequestParams.safeParse({
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

describe("categoria do evento na criacao por pessoa", () => {
    it("permuta grava categoria nula mesmo recebendo uma", async () => {
        const { useCase, proposalRepository } = build([]);
        await useCase.execute({ ...base, serviceIds: [], eventCategory: "BIRTHDAY" });
        expect(proposalRepository.createPerPerson).toHaveBeenCalledWith(expect.objectContaining({ eventCategory: null }));
    });

    it.each([undefined, "FESTA"])("evento com categoria %s nao grava", async (eventCategory) => {
        const { useCase, proposalRepository } = build([]);
        await expect(useCase.execute({ ...base, type: "EVENT", serviceIds: [], eventCategory } as never))
            .rejects.toThrow(EVENT_CATEGORY_MESSAGE);
        expect(proposalRepository.createPerPerson).not.toHaveBeenCalled();
    });
});

describe("preco de tabela na criacao por pessoa", () => {
    type PricedVenue = Record<string, unknown>;
    const fixedService = [{ id: "limpeza", venueId: "venue-1", price: 300, pricingType: "FIXED" as const }];

    function buildPriced(pricedVenue: PricedVenue, revenue: number | null = null, increasePercent?: number) {
        const goalRepository = {
            findByVenueAndRevenue: vi.fn(async () => (increasePercent ? { increasePercent } : null)),
        };
        const proposalRepository = {
            createPerPerson: vi.fn(async (data: { totalAmount: number }) => ({ ...saved, totalAmount: data.totalAmount })),
            monthlyRevenueAnalysis: vi.fn(async () => revenue),
        };
        const serviceRepository = { listForQuote: vi.fn(async () => fixedService) };
        const useCase = new CreateProposalPerPersonUseCase(
            { getById: vi.fn() } as never,
            goalRepository as never,
            { getById: vi.fn(async () => pricedVenue) } as never,
            serviceRepository as never,
            { create: vi.fn() } as never,
            proposalRepository as never,
            { create: vi.fn() } as never,
        );
        const quote = new QuoteProposalUseCase(
            { assert: vi.fn(async () => pricedVenue) } as never,
            serviceRepository as never,
            proposalRepository as never,
            goalRepository as never,
        );
        return { useCase, quote, proposalRepository };
    }

    const perPerson = {
        id: "venue-1",
        pricingModel: "PER_PERSON",
        pricePerPerson: 100,
        standardEventDuration: 4,
        minimumPrice: null,
        minimumPricePeriods: [],
        seasonalFee: [],
    };
    const perPersonHour = { ...perPerson, pricingModel: "PER_PERSON_HOUR", pricePerPerson: null, pricePerPersonHour: 50 };

    async function createAndQuote(built: ReturnType<typeof buildPriced>, hours = { startHour: "18:00", endHour: "22:00" }) {
        await built.useCase.execute({ ...base, ...hours, type: "EVENT", eventCategory: "CORPORATE", serviceIds: ["limpeza"] } as never);
        const quoted = await built.quote.execute({
            userId: "user-1",
            venueId: "venue-1",
            date: base.date,
            ...hours,
            guestNumber: 10,
            serviceIds: ["limpeza"],
            serviceHours: [],
            type: "EVENT",
        } as never);
        const stored = built.proposalRepository.createPerPerson.mock.calls[0][0] as unknown as Record<string, number>;
        expect(stored.totalAmount).toBe(quoted.data.totalAmount);
        expect(stored.basePrice).toBe(quoted.data.basePrice);
        expect(stored.extraHoursQty).toBe(quoted.data.extraHoursQty);
        return stored;
    }

    it("por pessoa sem meta grava o mesmo total da cotacao", async () => {
        const stored = await createAndQuote(buildPriced(perPerson));
        expect(stored).toMatchObject({ basePrice: 1000, totalAmount: 1300, extraHoursQty: 0 });
    });

    it("por pessoa com meta aplica o aumento", async () => {
        const stored = await createAndQuote(buildPriced(perPerson, 5000, 10));
        expect(stored).toMatchObject({ basePrice: 1100, totalAmount: 1400 });
    });

    it("por pessoa/hora sem faturamento multiplica pela duracao", async () => {
        const stored = await createAndQuote(buildPriced(perPersonHour));
        expect(stored).toMatchObject({ basePrice: 2000, extraHourPrice: 500, extraHoursQty: 0, totalAmount: 2300 });
    });

    it("por pessoa/hora com faturamento cobra horas extras", async () => {
        const stored = await createAndQuote(buildPriced(perPersonHour, 5000), { startHour: "16:00", endHour: "22:00" });
        expect(stored).toMatchObject({ basePrice: 500, extraHourPrice: 83, extraHoursQty: 2, totalAmount: 966 });
    });

    it("abaixo do minimo grava o minimo mais servicos", async () => {
        const stored = await createAndQuote(buildPriced({ ...perPerson, minimumPrice: 5000 }));
        expect(stored).toMatchObject({ basePrice: 5000, extraHoursQty: 0, totalAmount: 5300 });
    });
});
