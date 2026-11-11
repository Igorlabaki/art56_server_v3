import { HttpBadRequestError } from "../errors/errors-type/htttp-bad-request-error";

export const EVENT_CATEGORIES = ["CORPORATE", "BIRTHDAY", "BACHELOR_PARTY", "WEDDING", "COFFEE_BREAK", "OTHER"] as const;

export type EventCategory = typeof EVENT_CATEGORIES[number];

export const EVENT_CATEGORY_MESSAGE = "Selecione a categoria do evento";

function isEventCategory(value: unknown): value is EventCategory {
    return typeof value === "string" && (EVENT_CATEGORIES as readonly string[]).includes(value);
}

export interface EventCategoryCount {
    key: EventCategory | null;
    count: number;
}

/** Uma entrada por categoria, na ordem da lista, mais `null` para quem nao tem categoria. */
export function eventCategoryCounts(rows: { eventCategory: string | null; count: number }[]): EventCategoryCount[] {
    const counts = new Map<EventCategory | null, number>([
        ...EVENT_CATEGORIES.map((key) => [key, 0] as const),
        [null, 0],
    ]);
    rows.forEach(({ eventCategory, count }) => {
        const key = eventCategory === null ? null : isEventCategory(eventCategory) ? eventCategory : "OTHER";
        counts.set(key, (counts.get(key) ?? 0) + count);
    });
    return [...counts].map(([key, count]) => ({ key, count }));
}

export function resolveEventCategory(type: string, value: unknown): EventCategory | null {
    if (type !== "EVENT") return null;
    if (!isEventCategory(value)) throw new HttpBadRequestError(EVENT_CATEGORY_MESSAGE);
    return value;
}
