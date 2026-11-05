import { calcEventDuration } from "./calc-event-duration";
import { HttpBadRequestError } from "../errors/errors-type/htttp-bad-request-error";

export type ServicePricingType = "FIXED" | "PER_HOUR" | "PER_PERSON";

export interface ServiceForQuote {
    id: string;
    venueId: string;
    price: number;
    pricingType: ServicePricingType;
}

export interface ServiceQuoteLine {
    serviceId: string;
    pricingType: ServicePricingType;
    unitPrice: number;
    quantity: number;
    amount: number;
}

export const SERVICE_HOURS_MESSAGE = "Informe um número inteiro de horas para o serviço.";
export const MAX_SERVICE_HOURS = 8760;

export function serviceHoursOverEventMessage(eventHours: number): string {
    const unit = eventHours === 1 ? "hora" : "horas";
    return `O serviço não pode ter mais horas do que o evento (${eventHours} ${unit}).`;
}

export function quoteServiceLines(input: {
    venueId: string;
    serviceIds: string[];
    services: ServiceForQuote[];
    guestNumber: number;
    startDate: Date;
    endDate: Date;
    hoursByServiceId?: Record<string, number>;
}): ServiceQuoteLine[] {
    const byId = new Map(input.services.map((service) => [service.id, service]));
    const hours = calcEventDuration(input.startDate, input.endDate);
    const seen = new Set<string>();

    return input.serviceIds.filter((serviceId) => {
        if (seen.has(serviceId)) return false;
        seen.add(serviceId);
        return true;
    }).map((serviceId) => {
        const service = byId.get(serviceId);
        if (!service || service.venueId !== input.venueId) {
            throw new HttpBadRequestError("Servico nao pertence a este espaco");
        }
        if (service.price < 0) {
            throw new HttpBadRequestError("Preco do servico nao pode ser negativo");
        }

        const quantity = quantityFor(service, hours, input.guestNumber, input.hoursByServiceId);
        return {
            serviceId: service.id,
            pricingType: service.pricingType,
            unitPrice: service.price,
            quantity,
            amount: service.price * quantity,
        };
    });
}

export function serviceHoursMap(entries?: { serviceId: string; hours: number }[]): Record<string, number> {
    const map: Record<string, number> = {};
    for (const entry of entries ?? []) {
        if (Object.prototype.hasOwnProperty.call(map, entry.serviceId)) {
            throw new HttpBadRequestError(SERVICE_HOURS_MESSAGE);
        }
        map[entry.serviceId] = entry.hours;
    }
    return map;
}

export function assertChosenServiceHours(
    serviceIds: string[],
    services: ServiceForQuote[],
    hoursByServiceId: Record<string, number>,
    eventHours: number,
) {
    const byId = new Map(services.map((service) => [service.id, service]));
    const seen = new Set<string>();
    for (const serviceId of serviceIds) {
        if (seen.has(serviceId)) continue;
        seen.add(serviceId);
        const service = byId.get(serviceId);
        if (service?.pricingType !== "PER_HOUR") continue;
        if (!Object.prototype.hasOwnProperty.call(hoursByServiceId, serviceId)) {
            throw new HttpBadRequestError(SERVICE_HOURS_MESSAGE);
        }
        const chosen = hoursByServiceId[serviceId];
        if (Number.isInteger(chosen) && chosen > eventHours) {
            throw new HttpBadRequestError(serviceHoursOverEventMessage(eventHours));
        }
    }
}

export function sumServiceQuote(lines: ServiceQuoteLine[]): number {
    return lines.reduce((total, line) => total + line.amount, 0);
}

function quantityFor(
    service: ServiceForQuote,
    eventHours: number,
    guestNumber: number,
    hoursByServiceId?: Record<string, number>,
): number {
    if (service.pricingType === "PER_PERSON") return guestNumber;
    if (service.pricingType !== "PER_HOUR") return 1;
    if (!hoursByServiceId || !Object.prototype.hasOwnProperty.call(hoursByServiceId, service.id)) {
        return eventHours;
    }
    const chosen = hoursByServiceId[service.id];
    if (!Number.isInteger(chosen) || chosen < 0 || chosen > MAX_SERVICE_HOURS) {
        throw new HttpBadRequestError(SERVICE_HOURS_MESSAGE);
    }
    if (chosen === 0 && eventHours !== 0) {
        throw new HttpBadRequestError(SERVICE_HOURS_MESSAGE);
    }
    return chosen;
}
