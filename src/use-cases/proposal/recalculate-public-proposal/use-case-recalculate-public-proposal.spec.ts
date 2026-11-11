import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { RecalculatePublicProposalUseCase } from "./use-case-recalculate-public-proposal";

const HISTORY_ACTION = "Cliente atualizou data, convidados e horas pelo link";

describe("RecalculatePublicProposalUseCase", () => {
    const proposalRepository = {
        getById: vi.fn(),
        update: vi.fn(async (param: { proposalId: string; data: { serviceLines?: unknown } }) => ({ id: param.proposalId })),
        monthlyRevenueAnalysis: vi.fn(async () => null as number | null),
    };
    const venueRepository = { getById: vi.fn() };
    const cleanup = [{ id: "svc-limpeza", venueId: "venue-1", price: 300, pricingType: "FIXED" as const }];
    const serviceRepository = { listForQuote: vi.fn(async () => cleanup) };
    const historyRepository = { create: vi.fn() };
    const goalRepository = { findByVenueAndRevenue: vi.fn() };

    const useCase = new RecalculatePublicProposalUseCase(
        venueRepository as never,
        serviceRepository as never,
        historyRepository as never,
        proposalRepository as never,
        goalRepository as never,
    );

    const sameDay = {
        id: "proposal-1",
        venueId: "venue-1",
        approved: false,
        paid: false,
        type: "EVENT",
        startDate: new Date("2026-11-20T14:00:00.000Z"),
        endDate: new Date("2026-11-20T20:00:00.000Z"),
        proposalServices: [{ serviceId: "svc-limpeza" }],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        proposalRepository.getById.mockResolvedValue(sameDay);
        proposalRepository.monthlyRevenueAnalysis.mockResolvedValue(null);
        serviceRepository.listForQuote.mockResolvedValue(cleanup);
        venueRepository.getById.mockResolvedValue({
            id: "venue-1",
            maxGuest: 80,
            pricingModel: "PER_PERSON",
            pricePerPerson: 180,
            pricePerPersonHour: null,
            pricePerDay: null,
            pricePerPersonDay: null,
            standardEventDuration: 6,
            minimumPrice: null,
            minimumPricePeriods: [],
            seasonalFee: [],
        });
    });

    function run(partial: { date?: string; guestNumber?: number; hours?: number } = {}) {
        return useCase.execute({
            proposalId: "proposal-1",
            date: "2026-11-20",
            guestNumber: 29,
            hours: 8,
            ...partial,
        });
    }

    it("recalcula por pessoa, lanca hora extra so acima da duracao padrao e soma o servico", async () => {
        const withinStandard = await run({ hours: 6 });
        expect(withinStandard.data).toMatchObject({
            guestNumber: 29,
            basePrice: 5220,
            extraHoursQty: 0,
            extraHourPrice: 870,
            totalAmount: 5520,
        });

        const withExtra = await run({ hours: 8 });
        expect(withExtra.data).toMatchObject({
            basePrice: 5220,
            extraHoursQty: 2,
            extraHourPrice: 870,
            totalAmount: 7260,
        });
        expect(proposalRepository.update).toHaveBeenLastCalledWith(expect.objectContaining({
            proposalId: "proposal-1",
            data: expect.objectContaining({
                guestNumber: 29,
                basePrice: 5220,
                extraHoursQty: 2,
                totalAmount: 7260,
                serviceIds: ["svc-limpeza"],
            }),
        }));
        const written = proposalRepository.update.mock.calls.at(-1)?.[0].data;
        expect(Object.keys(written).sort()).toEqual([
            "basePrice",
            "discountAmount",
            "discountPercent",
            "endDate",
            "extraHourPrice",
            "extraHoursQty",
            "guestNumber",
            "serviceIds",
            "serviceLines",
            "startDate",
            "totalAmount",
        ]);
        const firstLines = proposalRepository.update.mock.calls[0][0].data.serviceLines;
        const secondLines = proposalRepository.update.mock.calls[1][0].data.serviceLines;
        expect(secondLines).toEqual(firstLines);
        expect(firstLines).toEqual([{
            serviceId: "svc-limpeza",
            pricingType: "FIXED",
            unitPrice: 300,
            quantity: 1,
            courtesyQuantity: 0,
            amount: 300,
        }]);
    });

    it("troca a locacao pelo minimo e tira as horas extras", async () => {
        venueRepository.getById.mockResolvedValue({
            id: "venue-1",
            maxGuest: 80,
            pricingModel: "PER_PERSON",
            pricePerPerson: 10,
            standardEventDuration: 6,
            minimumPrice: 5000,
            minimumPricePeriods: [],
            seasonalFee: [],
        });
        serviceRepository.listForQuote.mockResolvedValue([{
            id: "svc-limpeza",
            venueId: "venue-1",
            price: 100,
            pricingType: "FIXED",
        }]);

        const response = await run({ guestNumber: 2, hours: 8 });

        expect(response.data).toMatchObject({
            basePrice: 5000,
            extraHoursQty: 0,
            extraHourPrice: 0,
            totalAmount: 5100,
        });
    });

    it("cobra por pessoa e hora pela duracao quando nao ha receita no mes", async () => {
        venueRepository.getById.mockResolvedValue({
            id: "venue-1",
            maxGuest: 80,
            pricingModel: "PER_PERSON_HOUR",
            pricePerPersonHour: 10,
            standardEventDuration: 6,
            minimumPrice: null,
            seasonalFee: [],
        });
        proposalRepository.getById.mockResolvedValue({ ...sameDay, proposalServices: [] });
        serviceRepository.listForQuote.mockResolvedValue([]);

        const response = await run({ guestNumber: 4, hours: 8 });

        expect(response.data).toMatchObject({
            basePrice: 320,
            extraHoursQty: 0,
            extraHourPrice: 40,
            totalAmount: 320,
        });
        expect(proposalRepository.monthlyRevenueAnalysis).toHaveBeenCalled();
    });

    it("cobra uma diaria no mesmo dia civil e grava os convidados sem hora extra", async () => {
        venueRepository.getById.mockResolvedValue({
            id: "venue-1",
            maxGuest: 80,
            pricingModel: "PER_DAY",
            pricePerDay: 1000,
            standardEventDuration: 6,
            minimumPrice: null,
            seasonalFee: [],
        });
        proposalRepository.getById.mockResolvedValue({ ...sameDay, proposalServices: [] });
        serviceRepository.listForQuote.mockResolvedValue([]);

        const response = await run({ guestNumber: 40, hours: 5 });

        expect(response.data).toMatchObject({
            guestNumber: 40,
            basePrice: 1000,
            extraHoursQty: 0,
            extraHourPrice: 0,
            totalAmount: 1000,
        });
    });

    it("recusa sem gravar quando o orcamento nao pode ser recalculado", async () => {
        const cases: Array<{ proposal?: Record<string, unknown>; venue?: Record<string, unknown>; hours?: number; guestNumber?: number }> = [
            { proposal: { approved: true } },
            { proposal: { paid: true } },
            { guestNumber: 81 },
            { proposal: { endDate: new Date("2026-11-21T12:00:00.000Z") } },
            { hours: 12 },
            { proposal: { type: "BARTER" } },
            { venue: { pricingModel: "TIERED", pricePerPerson: null } },
        ];

        for (const item of cases) {
            proposalRepository.update.mockClear();
            proposalRepository.getById.mockResolvedValue({ ...sameDay, ...item.proposal });
            if (item.venue) {
                venueRepository.getById.mockResolvedValue({
                    id: "venue-1",
                    maxGuest: 80,
                    pricePerPerson: 180,
                    standardEventDuration: 6,
                    minimumPrice: null,
                    seasonalFee: [],
                    ...item.venue,
                });
            }

            await expect(run({
                hours: item.hours ?? 8,
                guestNumber: item.guestNumber ?? 29,
            })).rejects.toBeInstanceOf(HttpBadRequestError);
            expect(proposalRepository.update).not.toHaveBeenCalled();
        }
    });

    it("conserva as horas escolhidas e segue os convidados no servico por pessoa", async () => {
        proposalRepository.getById.mockResolvedValue({
            ...sameDay,
            proposalServices: [
                { serviceId: "svc-hora", pricingType: "PER_HOUR", quantity: 3 },
                { serviceId: "svc-pessoa", pricingType: "PER_PERSON", quantity: 10 },
                { serviceId: "svc-sem-qtd", pricingType: "PER_HOUR" },
            ],
        });
        serviceRepository.listForQuote.mockResolvedValue([
            { id: "svc-hora", venueId: "venue-1", price: 50, pricingType: "PER_HOUR" },
            { id: "svc-pessoa", venueId: "venue-1", price: 10, pricingType: "PER_PERSON" },
            { id: "svc-sem-qtd", venueId: "venue-1", price: 20, pricingType: "PER_HOUR" },
        ]);

        await run({ hours: 8, guestNumber: 12 });

        const written = proposalRepository.update.mock.calls.at(-1)?.[0].data;
        expect(written.serviceLines).toEqual([
            { serviceId: "svc-hora", pricingType: "PER_HOUR", unitPrice: 50, quantity: 3, courtesyQuantity: 0, amount: 150 },
            { serviceId: "svc-pessoa", pricingType: "PER_PERSON", unitPrice: 10, quantity: 12, courtesyQuantity: 0, amount: 120 },
            { serviceId: "svc-sem-qtd", pricingType: "PER_HOUR", unitPrice: 20, quantity: 8, courtesyQuantity: 0, amount: 160 },
        ]);
        expect(written.basePrice).toBe(2160);
        expect(written.extraHoursQty).toBe(2);
    });

    it("de 100 para 5 convidados a cortesia 10 por pessoa vira 5 e valor 0", async () => {
        proposalRepository.getById.mockResolvedValue({
            ...sameDay,
            proposalServices: [
                { serviceId: "svc-pessoa", pricingType: "PER_PERSON", quantity: 100, courtesyQuantity: 10 },
                { serviceId: "svc-hora", pricingType: "PER_HOUR", quantity: 3, courtesyQuantity: 1 },
            ],
        });
        serviceRepository.listForQuote.mockResolvedValue([
            { id: "svc-pessoa", venueId: "venue-1", price: 10, pricingType: "PER_PERSON" },
            { id: "svc-hora", venueId: "venue-1", price: 50, pricingType: "PER_HOUR" },
        ]);

        await run({ guestNumber: 5 });

        const written = proposalRepository.update.mock.calls.at(-1)?.[0].data;
        expect(written.serviceLines).toEqual([
            expect.objectContaining({ serviceId: "svc-pessoa", quantity: 5, courtesyQuantity: 5, amount: 0 }),
            expect.objectContaining({ serviceId: "svc-hora", quantity: 3, courtesyQuantity: 1, amount: 100 }),
        ]);
    });

    it("registra o historico do link sem usuario", async () => {
        await run();

        expect(historyRepository.create).toHaveBeenCalledWith({
            proposalId: "proposal-1",
            action: HISTORY_ACTION,
        });
    });

    describe("desconto", () => {
        const discounted = { ...sameDay, guestNumber: 29, totalAmount: 4968, discountPercent: 10, discountAmount: 552 };

        beforeEach(() => {
            proposalRepository.getById.mockResolvedValue(discounted);
        });

        it("mesma data, convidados e horas aplica 10% sobre o subtotal recalculado", async () => {
            const response = await run({ guestNumber: 29, hours: 6 });
            const written = proposalRepository.update.mock.calls.at(-1)?.[0].data;
            expect(written).toMatchObject({ totalAmount: 4968, discountPercent: 10, discountAmount: 552 });
            expect(response.data).toMatchObject({ totalAmount: 4968, discountPercent: 10, discountAmount: 552 });
            expect(historyRepository.create).toHaveBeenCalledWith({ proposalId: "proposal-1", action: HISTORY_ACTION });
        });

        it.each([
            ["convidados", { guestNumber: 30, hours: 6 }, 5700],
            ["horas", { guestNumber: 29, hours: 8 }, 7260],
            ["data", { guestNumber: 29, hours: 6, date: "2026-11-21" }, 5520],
        ])("%s novos gravam o subtotal e desconto 0", async (_label, partial, subtotal) => {
            const response = await run(partial);
            const written = proposalRepository.update.mock.calls.at(-1)?.[0].data;
            expect(written).toMatchObject({ totalAmount: subtotal, discountPercent: 0, discountAmount: 0 });
            expect(response.data).toMatchObject({ totalAmount: subtotal, discountPercent: 0, discountAmount: 0 });
            expect(historyRepository.create).toHaveBeenCalledWith({
                proposalId: "proposal-1",
                action: `${HISTORY_ACTION} (desconto de 10% removido)`,
            });
        });
    });
});
