import { describe, expect, it, vi } from "vitest";
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { SERVICE_HOURS_MESSAGE } from "../../../functions/quote-service-lines";
import { EVENT_CATEGORY_MESSAGE } from "../../../functions/event-category";
import { CreateProposalPerPersonUseCase } from "./use-case-create-proposal-per-person";
import { NO_QUOTE_MESSAGE, QuoteProposalUseCase } from "../quote-proposal/use-case-quote-proposal";
import { DISCOUNT_MESSAGE } from "../../../functions/proposal-discount";
import { updateProposalPerPersonRequestParams } from "../../../zod/proposal/update-proposal-per-person-params-schema";
import { HttpForbiddenError } from "../../../errors/errors-type/http-forbidden-error";
import { HttpTokenError } from "../../../errors/errors-type/http-token-error";
import { courtesyAuthorizer, OWNER_ID, STRANGER_ID } from "../courtesy-authorizer.test-helper";

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

describe("cortesia na criacao por pessoa", () => {
    const pricedVenue = {
        id: "venue-1",
        organizationId: "org-1",
        pricingModel: "PER_PERSON",
        pricePerPerson: 100,
        standardEventDuration: 4,
        minimumPrice: null,
        minimumPricePeriods: [],
        seasonalFee: [],
    };
    const led = [{ id: "led", venueId: "venue-1", price: 250, pricingType: "PER_HOUR" as const }];
    const event = {
        ...base,
        type: "EVENT" as const,
        eventCategory: "CORPORATE" as const,
        serviceIds: ["led"],
        serviceHours: [{ serviceId: "led", hours: 4 }],
    };

    function buildCourtesy(services = led) {
        const { authorizer, assert } = courtesyAuthorizer(pricedVenue);
        const proposalRepository = {
            createPerPerson: vi.fn(async (data: { totalAmount: number }) => ({ ...saved, totalAmount: data.totalAmount })),
            monthlyRevenueAnalysis: vi.fn(async () => null),
        };
        const useCase = new CreateProposalPerPersonUseCase(
            { getById: vi.fn(async () => ({ id: OWNER_ID, username: "dono" })) } as never,
            { findByVenueAndRevenue: vi.fn(async () => null) } as never,
            { getById: vi.fn(async () => pricedVenue) } as never,
            { listForQuote: vi.fn(async () => services) } as never,
            { create: vi.fn() } as never,
            proposalRepository as never,
            { create: vi.fn() } as never,
            authorizer,
        );
        const stored = () => proposalRepository.createPerPerson.mock.calls[0][0] as unknown as {
            totalAmount: number;
            serviceLines: Array<{ courtesyQuantity: number; amount: number }>;
        };
        return { useCase, proposalRepository, assert, stored };
    }

    it("com permissao grava a cortesia e o total cai 2 x unitario", async () => {
        const plain = buildCourtesy();
        await plain.useCase.execute(event as never, OWNER_ID);

        const withCourtesy = buildCourtesy();
        await withCourtesy.useCase.execute({
            ...event,
            serviceCourtesy: [{ serviceId: "led", quantity: 2 }],
        } as never, OWNER_ID);

        expect(withCourtesy.stored().serviceLines[0]).toMatchObject({ quantity: 4, courtesyQuantity: 2, amount: 500 });
        expect(plain.stored().totalAmount - withCourtesy.stored().totalAmount).toBe(500);
        expect(withCourtesy.assert).toHaveBeenCalledTimes(1);
    });

    it("sem token e com cortesia responde 401 e nao grava", async () => {
        const { useCase, proposalRepository } = buildCourtesy();
        await expect(useCase.execute({
            ...event,
            serviceCourtesy: [{ serviceId: "led", quantity: 2 }],
        } as never)).rejects.toBeInstanceOf(HttpTokenError);
        expect(proposalRepository.createPerPerson).not.toHaveBeenCalled();
    });

    it("token sem permissao responde 403 e nao grava", async () => {
        const { useCase, proposalRepository } = buildCourtesy();
        await expect(useCase.execute({
            ...event,
            serviceCourtesy: [{ serviceId: "led", quantity: 2 }],
        } as never, STRANGER_ID)).rejects.toThrow("Você não tem permissão para dar cortesia neste espaço.");
        expect(proposalRepository.createPerPerson).not.toHaveBeenCalled();
    });

    it("userId do corpo com permissao nao vale com token de outro usuario", async () => {
        const { useCase, proposalRepository } = buildCourtesy();
        await expect(useCase.execute({
            ...event,
            userId: OWNER_ID,
            serviceCourtesy: [{ serviceId: "led", quantity: 2 }],
        } as never, STRANGER_ID)).rejects.toBeInstanceOf(HttpForbiddenError);
        expect(proposalRepository.createPerPerson).not.toHaveBeenCalled();
    });

    it.each([undefined, [{ serviceId: "led", quantity: 0 }]])("cortesia %j cria sem chamar o autorizador", async (serviceCourtesy) => {
        const { useCase, assert, stored } = buildCourtesy();
        await useCase.execute({ ...event, serviceCourtesy } as never);
        expect(assert).not.toHaveBeenCalled();
        expect(stored().serviceLines[0]).toMatchObject({ courtesyQuantity: 0, amount: 1000 });
    });

    it("permuta com cortesia grava a cortesia e total 0", async () => {
        const { useCase, stored } = buildCourtesy();
        await useCase.execute({
            ...event,
            type: "BARTER",
            serviceCourtesy: [{ serviceId: "led", quantity: 1 }],
        } as never, OWNER_ID);
        expect(stored().totalAmount).toBe(0);
        expect(stored().serviceLines[0]).toMatchObject({ courtesyQuantity: 1, amount: 750 });
    });

    it("total manual com cortesia mantem o total digitado", async () => {
        const { useCase, stored } = buildCourtesy();
        await useCase.execute({
            ...event,
            totalAmountInput: "5000",
            serviceCourtesy: [{ serviceId: "led", quantity: 2 }],
        } as never, OWNER_ID);
        expect(stored().totalAmount).toBe(5000);
        expect(stored().serviceLines[0]).toMatchObject({ courtesyQuantity: 2, amount: 500 });
    });

    it("cortesia acima das horas nao grava", async () => {
        const { useCase, proposalRepository } = buildCourtesy();
        await expect(useCase.execute({
            ...event,
            serviceCourtesy: [{ serviceId: "led", quantity: 5 }],
        } as never, OWNER_ID)).rejects.toBeInstanceOf(HttpBadRequestError);
        expect(proposalRepository.createPerPerson).not.toHaveBeenCalled();
    });
});

describe("desconto na criacao por pessoa", () => {
    const pricedVenue = {
        id: "venue-1",
        organizationId: "org-1",
        pricingModel: "PER_PERSON",
        pricePerPerson: 100,
        standardEventDuration: 4,
        minimumPrice: null,
        minimumPricePeriods: [],
        seasonalFee: [],
    };
    const decor = [{ id: "decor", venueId: "venue-1", price: 800, pricingType: "FIXED" as const }];
    const event = {
        ...base,
        type: "EVENT" as const,
        eventCategory: "CORPORATE" as const,
        guestNumber: "50",
        serviceIds: ["decor"],
    };

    function buildDiscount(venueForQuote: Record<string, unknown> = pricedVenue) {
        const { authorizer, assert } = courtesyAuthorizer(pricedVenue);
        const proposalRepository = {
            createPerPerson: vi.fn(async (data: { totalAmount: number }) => ({ ...saved, totalAmount: data.totalAmount })),
            monthlyRevenueAnalysis: vi.fn(async () => null),
        };
        const useCase = new CreateProposalPerPersonUseCase(
            { getById: vi.fn(async () => ({ id: OWNER_ID, username: "dono" })) } as never,
            { findByVenueAndRevenue: vi.fn(async () => null) } as never,
            { getById: vi.fn(async () => venueForQuote) } as never,
            { listForQuote: vi.fn(async () => decor) } as never,
            { create: vi.fn() } as never,
            proposalRepository as never,
            { create: vi.fn() } as never,
            authorizer,
        );
        const stored = () => proposalRepository.createPerPerson.mock.calls[0][0] as unknown as Record<string, number>;
        return { useCase, proposalRepository, assert, stored };
    }

    it("com permissao grava 10%, 580 e 5220 mesmo com Total digitado", async () => {
        const { useCase, stored } = buildDiscount();
        await useCase.execute({ ...event, discountPercent: 10, totalAmountInput: "4000" } as never, OWNER_ID);
        expect(stored()).toMatchObject({ discountPercent: 10, discountAmount: 580, totalAmount: 5220 });
    });

    it("sem desconto grava 0 e o subtotal", async () => {
        const { useCase, assert, stored } = buildDiscount();
        await useCase.execute(event as never);
        expect(assert).not.toHaveBeenCalled();
        expect(stored()).toMatchObject({ discountPercent: 0, discountAmount: 0, totalAmount: 5800 });
    });

    it("sem token e com desconto responde 401 e nao grava", async () => {
        const { useCase, proposalRepository } = buildDiscount();
        await expect(useCase.execute({ ...event, discountPercent: 10 } as never)).rejects.toBeInstanceOf(HttpTokenError);
        expect(proposalRepository.createPerPerson).not.toHaveBeenCalled();
    });

    it("token sem permissao responde 403 e nao grava", async () => {
        const { useCase, proposalRepository } = buildDiscount();
        await expect(useCase.execute({ ...event, discountPercent: 10 } as never, STRANGER_ID))
            .rejects.toThrow("Você não tem permissão para dar desconto neste espaço.");
        expect(proposalRepository.createPerPerson).not.toHaveBeenCalled();
    });

    it("userId do corpo com permissao nao vale com token de outro usuario", async () => {
        const { useCase, proposalRepository } = buildDiscount();
        await expect(useCase.execute({ ...event, userId: OWNER_ID, discountPercent: 10 } as never, STRANGER_ID))
            .rejects.toBeInstanceOf(HttpForbiddenError);
        expect(proposalRepository.createPerPerson).not.toHaveBeenCalled();
    });

    it("espaco sem preco de catalogo responde 400", async () => {
        const { useCase, proposalRepository } = buildDiscount({ ...pricedVenue, pricePerPerson: null });
        await expect(useCase.execute({ ...event, discountPercent: 10, totalAmountInput: "4000" } as never, OWNER_ID))
            .rejects.toThrow(NO_QUOTE_MESSAGE);
        expect(proposalRepository.createPerPerson).not.toHaveBeenCalled();
    });

    it("% invalida responde 400 e nao grava", async () => {
        const { useCase, proposalRepository } = buildDiscount();
        await expect(useCase.execute({ ...event, discountPercent: 100.01 } as never, OWNER_ID))
            .rejects.toThrow(DISCOUNT_MESSAGE);
        expect(proposalRepository.createPerPerson).not.toHaveBeenCalled();
    });

    it("total manual grava desconto 0", async () => {
        const { useCase, stored } = buildDiscount({ ...pricedVenue, pricePerPerson: null });
        await useCase.execute({ ...event, totalAmountInput: "5000" } as never, OWNER_ID);
        expect(stored()).toMatchObject({ discountPercent: 0, discountAmount: 0, totalAmount: 5000 });
    });

    it("permuta com % no corpo grava desconto 0 sem autorizar", async () => {
        const { useCase, assert, stored } = buildDiscount();
        await useCase.execute({ ...event, type: "BARTER", discountPercent: 10 } as never);
        expect(assert).not.toHaveBeenCalled();
        expect(stored()).toMatchObject({ discountPercent: 0, discountAmount: 0, totalAmount: 0 });
    });
});
