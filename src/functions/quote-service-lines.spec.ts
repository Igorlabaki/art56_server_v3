import { describe, expect, it } from "vitest";
import { HttpBadRequestError } from "../errors/errors-type/htttp-bad-request-error";
import { quoteServiceLines, SERVICE_HOURS_MESSAGE, sumServiceQuote } from "./quote-service-lines";

const start = new Date("2026-06-01T18:00:00");
const end = new Date("2026-06-01T22:00:00");

function quote(overrides: Partial<Parameters<typeof quoteServiceLines>[0]> = {}) {
    return quoteServiceLines({
        venueId: "venue-a",
        serviceIds: ["svc"],
        services: [{ id: "svc", venueId: "venue-a", price: 100, pricingType: "FIXED" }],
        guestNumber: 80,
        startDate: start,
        endDate: end,
        ...overrides,
    });
}

describe("quoteServiceLines", () => {
    it("fixo cobra o unitario uma vez", () => {
        const lines = quote();
        expect(lines).toEqual([{
            serviceId: "svc",
            pricingType: "FIXED",
            unitPrice: 100,
            quantity: 1,
            amount: 100,
        }]);
        expect(sumServiceQuote(lines)).toBe(100);
    });

    it("por pessoa multiplica pelos convidados", () => {
        const lines = quote({
            services: [{ id: "svc", venueId: "venue-a", price: 40, pricingType: "PER_PERSON" }],
        });
        expect(lines[0]).toMatchObject({ quantity: 80, amount: 3200, unitPrice: 40 });
    });

    it("por hora multiplica pelas horas do evento, inclusive quando o fim cai no dia seguinte", () => {
        const lines = quote({
            services: [{ id: "svc", venueId: "venue-a", price: 50, pricingType: "PER_HOUR" }],
            startDate: new Date("2026-06-01T22:00:00"),
            endDate: new Date("2026-06-01T02:00:00"),
        });
        expect(lines[0]).toMatchObject({ quantity: 4, amount: 200 });
    });

    it("duracao 0 gera linha 0", () => {
        const lines = quote({
            services: [{ id: "svc", venueId: "venue-a", price: 50, pricingType: "PER_HOUR" }],
            startDate: start,
            endDate: start,
        });
        expect(lines[0]).toMatchObject({ quantity: 0, amount: 0 });
    });

    it("id de outro espaco falha e nao devolve linha", () => {
        expect(() => quote({
            serviceIds: ["svc-outro"],
            services: [{ id: "svc-outro", venueId: "venue-b", price: 10, pricingType: "FIXED" }],
        })).toThrow(HttpBadRequestError);
    });

    it("por hora informada usa o inteiro do mapa mesmo com outra duracao", () => {
        const lines = quote({
            services: [{ id: "svc", venueId: "venue-a", price: 50, pricingType: "PER_HOUR" }],
            hoursByServiceId: { svc: 3 },
        });
        expect(lines[0]).toMatchObject({ quantity: 3, amount: 150, unitPrice: 50 });
    });

    it("fixo e por pessoa ignoram o mapa de horas", () => {
        expect(quote({ hoursByServiceId: { svc: 3 } })[0]).toMatchObject({ quantity: 1, amount: 100 });
        const perPerson = quote({
            services: [{ id: "svc", venueId: "venue-a", price: 40, pricingType: "PER_PERSON" }],
            hoursByServiceId: { svc: 3 },
        });
        expect(perPerson[0]).toMatchObject({ quantity: 80, amount: 3200 });
    });

    it("zero so passa quando a duracao do evento tambem e zero", () => {
        expect(quote({
            services: [{ id: "svc", venueId: "venue-a", price: 50, pricingType: "PER_HOUR" }],
            startDate: start,
            endDate: start,
            hoursByServiceId: { svc: 0 },
        })[0]).toMatchObject({ quantity: 0, amount: 0 });

        expect(() => quote({
            services: [{ id: "svc", venueId: "venue-a", price: 50, pricingType: "PER_HOUR" }],
            hoursByServiceId: { svc: 0 },
        })).toThrow(HttpBadRequestError);
    });

    it("mapa acima da duracao ainda devolve essa quantidade", () => {
        const lines = quote({
            services: [{ id: "svc", venueId: "venue-a", price: 50, pricingType: "PER_HOUR" }],
            hoursByServiceId: { svc: 5 },
        });
        expect(lines[0]).toMatchObject({ quantity: 5, amount: 250 });
    });

    it("fracao continua na frase de inteiro", () => {
        expect(() => quote({
            services: [{ id: "svc", venueId: "venue-a", price: 50, pricingType: "PER_HOUR" }],
            hoursByServiceId: { svc: 1.5 },
        })).toThrow(SERVICE_HOURS_MESSAGE);
    });

    it("negativo, fracao e 8761 nao devolvem linha", () => {
        const hourly = [{ id: "svc", venueId: "venue-a", price: 50, pricingType: "PER_HOUR" as const }];
        for (const hours of [-1, 1.5, 8761]) {
            expect(() => quote({
                services: hourly,
                hoursByServiceId: { svc: hours },
            })).toThrow(HttpBadRequestError);
        }
    });

    it("preco negativo falha e preco zero gera linha 0", () => {
        expect(() => quote({
            services: [{ id: "svc", venueId: "venue-a", price: -1, pricingType: "FIXED" }],
        })).toThrow(HttpBadRequestError);

        const lines = quote({
            services: [{ id: "svc", venueId: "venue-a", price: 0, pricingType: "PER_PERSON" }],
        });
        expect(lines[0]).toMatchObject({ quantity: 80, amount: 0 });
    });
});
