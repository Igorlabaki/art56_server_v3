import { HttpBadRequestError } from "../errors/errors-type/htttp-bad-request-error";

export const EVENT_CATEGORIES = ["CORPORATE", "BIRTHDAY", "BACHELOR_PARTY", "WEDDING", "COFFEE_BREAK", "OTHER"] as const;

export type EventCategory = typeof EVENT_CATEGORIES[number];

export const EVENT_CATEGORY_MESSAGE = "Selecione a categoria do evento";

function isEventCategory(value: unknown): value is EventCategory {
    return typeof value === "string" && (EVENT_CATEGORIES as readonly string[]).includes(value);
}

export function resolveEventCategory(type: string, value: unknown): EventCategory | null {
    if (type !== "EVENT") return null;
    if (!isEventCategory(value)) throw new HttpBadRequestError(EVENT_CATEGORY_MESSAGE);
    return value;
}
