import { SeasonalFee } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { SERVICE_HOURS_MESSAGE, serviceHoursOverEventMessage } from "../../../functions/quote-service-lines";
import { EVENT_CATEGORY_MESSAGE } from "../../../functions/event-category";
import { UpdateProposalPerPersonUseCase } from "./use-case-update-proposal-per-person";
import { UpdateProposalPerPersonRequestParams } from "../../../zod/proposal/update-proposal-per-person-params-schema";
import { HttpForbiddenError } from "../../../errors/errors-type/http-forbidden-error";
import { courtesyAuthorizer, OWNER_ID, STRANGER_ID } from "../courtesy-authorizer.test-helper";
import { DISCOUNT_DENIAL } from "../proposal-quote-authorizer";
import { NO_QUOTE_MESSAGE } from "../quote-proposal/use-case-quote-proposal";

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
        eventCategory: "BIRTHDAY" as const,
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

    it("evento sem categoria nao grava", async () => {
        await expect(run({ eventCategory: undefined })).rejects.toThrow(EVENT_CATEGORY_MESSAGE);
        expect(proposalRepository.update).not.toHaveBeenCalled();
    });

    it("producao grava categoria nula mesmo recebendo uma", async () => {
        venueRepository.getById.mockResolvedValue({
            id: "venue-1",
            pricingModel: "PER_PERSON",
            pricePerPerson: 100,
            standardEventDuration: 6,
            minimumPrice: null,
            seasonalFee: [],
        });

        await run({ type: "PRODUCTION" });

        expect(proposalRepository.update.mock.calls[0][0].data).toMatchObject({ eventCategory: null });
    });

    it("evento grava a categoria escolhida", async () => {
        venueRepository.getById.mockResolvedValue({
            id: "venue-1",
            pricingModel: "PER_PERSON",
            pricePerPerson: 100,
            standardEventDuration: 6,
            minimumPrice: null,
            seasonalFee: [],
        });

        await run({ eventCategory: "WEDDING" });

        expect(proposalRepository.update.mock.calls[0][0].data).toMatchObject({ eventCategory: "WEDDING" });
    });

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

    it("aplica temporada que vira o ano (dez a jan) num evento de janeiro", async () => {
        venueRepository.getById.mockResolvedValue({
            id: "venue-1",
            pricingModel: "PER_PERSON",
            pricePerPerson: 100,
            standardEventDuration: 6,
            minimumPrice: null,
            seasonalFee: [fee({ type: "SURCHARGE", fee: 10, startDay: "15/12", endDay: "15/01" })],
        });

        const response = await run({ date: "10/01/2026" });

        expect(response.data.totalAmount).toBe(1100);
    });

    it("por pessoa/hora com total inalterado grava o calculo de tabela", async () => {
        venueRepository.getById.mockResolvedValue({
            id: "venue-1",
            pricingModel: "PER_PERSON_HOUR",
            pricePerPersonHour: 50,
            standardEventDuration: 4,
            minimumPrice: null,
            seasonalFee: [],
        });

        await run();

        expect(proposalRepository.update.mock.calls.at(-1)?.[0].data).toMatchObject({
            basePrice: 3000,
            extraHourPrice: 500,
            extraHoursQty: 0,
            totalAmount: 3000,
        });
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
            courtesyQuantity: 0,
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
            courtesyQuantity: 0,
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
            courtesyQuantity: 0,
            amount: 300,
        }]);
    });

    describe("cortesia", () => {
        const venue = { id: "venue-1", organizationId: "org-1" };
        const led = { id: "led", venueId: "venue-1", price: 250, pricingType: "PER_HOUR" };
        const courtesyData = {
            serviceIds: ["led"],
            serviceHours: [{ serviceId: "led", hours: 6 }],
            totalAmountInput: "1",
        };

        function courtesyUseCase() {
            const { authorizer, assert } = courtesyAuthorizer(venue);
            const withAuthorizer = new UpdateProposalPerPersonUseCase(
                { getById: vi.fn() } as never,
                venueRepository as never,
                serviceRepository as never,
                { create: vi.fn() } as never,
                proposalRepository as never,
                goalRepository as never,
                authorizer,
            );
            const exec = (data: Partial<UpdateProposalPerPersonRequestParams["data"]>, authUserId: string) =>
                withAuthorizer.execute({ proposalId: "proposal-1", data: { ...baseData, ...data } }, authUserId);
            return { exec, assert };
        }

        beforeEach(() => {
            hourlyVenue();
            proposalRepository.getById.mockResolvedValue({ id: "proposal-1", totalAmount: 1, venueId: "venue-1" });
            serviceRepository.listForQuote.mockResolvedValue([led]);
        });

        it("com permissao grava a cortesia", async () => {
            const { exec } = courtesyUseCase();
            await exec({ ...courtesyData, serviceCourtesy: [{ serviceId: "led", quantity: 2 }] }, OWNER_ID);
            const data = proposalRepository.update.mock.calls.at(-1)?.[0].data as Record<string, unknown>;
            expect(data.serviceLines).toEqual([expect.objectContaining({ quantity: 6, courtesyQuantity: 2, amount: 1000 })]);
            expect(data).not.toHaveProperty("serviceCourtesy");
        });

        it("sem serviceCourtesy grava 0 nas linhas", async () => {
            const { exec, assert } = courtesyUseCase();
            await exec(courtesyData, OWNER_ID);
            expect(assert).not.toHaveBeenCalled();
            expect(proposalRepository.update.mock.calls.at(-1)?.[0].data.serviceLines).toEqual([
                expect.objectContaining({ courtesyQuantity: 0, amount: 1500 }),
            ]);
        });

        it("token sem permissao responde 403 e nao chama update", async () => {
            const { exec } = courtesyUseCase();
            await expect(exec({
                ...courtesyData,
                userId: OWNER_ID,
                serviceCourtesy: [{ serviceId: "led", quantity: 2 }],
            }, STRANGER_ID)).rejects.toBeInstanceOf(HttpForbiddenError);
            expect(proposalRepository.update).not.toHaveBeenCalled();
            expect(proposalRepository.updateServices).not.toHaveBeenCalled();
        });

        it("autoriza no espaco do orcamento gravado, nao no venueId do corpo", async () => {
            const { exec, assert } = courtesyUseCase();
            await exec({
                ...courtesyData,
                venueId: "venue-outro",
                serviceCourtesy: [{ serviceId: "led", quantity: 2 }],
            }, OWNER_ID).catch(() => undefined);
            expect(assert).toHaveBeenCalledWith(OWNER_ID, "venue-1", expect.anything());
        });
    });

    describe("desconto", () => {
        const venue = { id: "venue-1", organizationId: "org-1" };
        const discountData = { guestNumber: "50", serviceIds: ["decor"] };

        function discountUseCase() {
            const { authorizer, assert } = courtesyAuthorizer(venue);
            const withAuthorizer = new UpdateProposalPerPersonUseCase(
                { getById: vi.fn() } as never,
                venueRepository as never,
                serviceRepository as never,
                { create: vi.fn() } as never,
                proposalRepository as never,
                goalRepository as never,
                authorizer,
            );
            const exec = (data: Partial<UpdateProposalPerPersonRequestParams["data"]>, authUserId: string) =>
                withAuthorizer.execute({ proposalId: "proposal-1", data: { ...baseData, ...discountData, ...data } }, authUserId);
            const stored = () => proposalRepository.update.mock.calls.at(-1)?.[0].data as unknown as Record<string, number>;
            return { exec, assert, stored };
        }

        beforeEach(() => {
            hourlyVenue();
            proposalRepository.getById.mockResolvedValue({ id: "proposal-1", totalAmount: 5800, venueId: "venue-1" });
            serviceRepository.listForQuote.mockResolvedValue([{ id: "decor", venueId: "venue-1", price: 800, pricingType: "FIXED" }]);
        });

        it("com 10% forca o recalculo mesmo com Total diferente do gravado", async () => {
            const { exec, stored } = discountUseCase();
            await exec({ discountPercent: 10, totalAmountInput: "4000" }, OWNER_ID);
            expect(stored()).toMatchObject({ discountPercent: 10, discountAmount: 580, totalAmount: 5220 });
            expect(stored()).not.toHaveProperty("totalAmountInput");
        });

        it("sem discountPercent e Total igual ao gravado recalcula e grava desconto 0", async () => {
            const { exec, assert, stored } = discountUseCase();
            await exec({ totalAmountInput: "5800" }, OWNER_ID);
            expect(assert).not.toHaveBeenCalled();
            expect(stored()).toMatchObject({ discountPercent: 0, discountAmount: 0, totalAmount: 5800 });
        });

        it("sem discountPercent e Total digitado grava o Total e desconto 0", async () => {
            const { exec, stored } = discountUseCase();
            await exec({ totalAmountInput: "2500" }, OWNER_ID);
            expect(stored()).toMatchObject({ discountPercent: 0, discountAmount: 0, totalAmount: 2500 });
        });

        it("permuta grava desconto 0", async () => {
            const { exec, stored } = discountUseCase();
            await exec({ type: "BARTER", discountPercent: 10 }, STRANGER_ID);
            expect(stored()).toMatchObject({ discountPercent: 0, discountAmount: 0, totalAmount: 0 });
        });

        it("token sem permissao responde 403 e nao chama update", async () => {
            const { exec } = discountUseCase();
            await expect(exec({ userId: OWNER_ID, discountPercent: 10 }, STRANGER_ID)).rejects.toBeInstanceOf(HttpForbiddenError);
            expect(proposalRepository.update).not.toHaveBeenCalled();
        });

        it("autoriza no espaco do orcamento gravado", async () => {
            const { exec, assert } = discountUseCase();
            await exec({ venueId: "venue-outro", discountPercent: 10 }, OWNER_ID).catch(() => undefined);
            expect(assert).toHaveBeenCalledWith(OWNER_ID, "venue-1", DISCOUNT_DENIAL);
        });

        it("espaco sem preco de catalogo responde 400", async () => {
            venueRepository.getById.mockResolvedValue({ id: "venue-1", pricingModel: "PER_PERSON", pricePerPerson: null, seasonalFee: [] });
            const { exec } = discountUseCase();
            await expect(exec({ discountPercent: 10 }, OWNER_ID)).rejects.toThrow(NO_QUOTE_MESSAGE);
            expect(proposalRepository.update).not.toHaveBeenCalled();
        });
    });
});
