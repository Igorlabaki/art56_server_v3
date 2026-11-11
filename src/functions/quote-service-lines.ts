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
    courtesyQuantity: number;
    amount: number;
}

export type CourtesyMode = "strict" | "clamp";

export const SERVICE_HOURS_MESSAGE = "Informe um número inteiro de horas para o serviço.";
export const MAX_SERVICE_HOURS = 8760;
export const COURTESY_MESSAGE = "Informe uma cortesia inteira, de 0 até a quantidade do serviço.";
export const MAX_COURTESY_QUANTITY = 100000;
export const MAX_COURTESY_ENTRIES = 100;

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
    courtesyByServiceId?: Record<string, number>;
    courtesyMode?: CourtesyMode;
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
        const courtesyQuantity = courtesyFor(
            service.id,
            quantity,
            input.courtesyByServiceId,
            input.courtesyMode ?? "strict",
        );
        return {
            serviceId: service.id,
            pricingType: service.pricingType,
            unitPrice: service.price,
            quantity,
            courtesyQuantity,
            amount: service.price * (quantity - courtesyQuantity),
        };
    });
}

export function serviceCourtesyMap(entries?: unknown): Record<string, number> {
    const map: Record<string, number> = {};
    if (entries === undefined || entries === null) return map;
    if (!Array.isArray(entries) || entries.length > MAX_COURTESY_ENTRIES) {
        throw new HttpBadRequestError(COURTESY_MESSAGE);
    }
    for (const entry of entries) {
        const serviceId = (entry as { serviceId?: unknown } | null)?.serviceId;
        const quantity = (entry as { quantity?: unknown } | null)?.quantity;
        if (typeof serviceId !== "string" || serviceId.length === 0 || !isValidCourtesy(quantity)) {
            throw new HttpBadRequestError(COURTESY_MESSAGE);
        }
        if (Object.prototype.hasOwnProperty.call(map, serviceId)) {
            throw new HttpBadRequestError(COURTESY_MESSAGE);
        }
        map[serviceId] = quantity;
    }
    return map;
}

export function hasCourtesy(map?: Record<string, number>): boolean {
    return Object.values(map ?? {}).some((quantity) => quantity > 0);
}

function isValidCourtesy(value: unknown): value is number {
    return typeof value === "number"
        && Number.isInteger(value)
        && value >= 0
        && value <= MAX_COURTESY_QUANTITY;
}

function courtesyFor(
    serviceId: string,
    quantity: number,
    courtesyByServiceId: Record<string, number> | undefined,
    mode: CourtesyMode,
): number {
    if (!courtesyByServiceId || !Object.prototype.hasOwnProperty.call(courtesyByServiceId, serviceId)) {
        return 0;
    }
    const courtesy = courtesyByServiceId[serviceId];
    if (!isValidCourtesy(courtesy)) {
        throw new HttpBadRequestError(COURTESY_MESSAGE);
    }
    if (courtesy <= quantity) return courtesy;
    if (mode === "clamp") return quantity;
    throw new HttpBadRequestError(COURTESY_MESSAGE);
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
