import { createHash } from "crypto";

export const PUBLIC_SURFACE_TIME_ZONE = "America/Sao_Paulo";

/** Corte estável da medição. Permanece nulo até o rollout gravar o instante. */
export const PUBLIC_SURFACE_ACTIVATED_AT: Date | null = null;

export const SITE_CREATION_ACTIONS = [
    "Cliente criou este orçamento pelo site",
    "Cliente criou este orcamento pelo site",
] as const;

const MONTH_KEY = /^(\d{4})-(0[1-9]|1[0-2])$/;
const VISITOR_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type PublicSurfaceName = "LINKS" | "FORM";

export function isMonthKey(month: string) {
    return MONTH_KEY.test(month);
}

export function hashVisitorKey(raw: string | null | undefined): string | null {
    if (!raw || !VISITOR_ID.test(raw)) return null;
    return createHash("sha256").update(raw.toLowerCase()).digest("hex");
}

export function isSiteCreationAction(action: string) {
    return (SITE_CREATION_ACTIONS as readonly string[]).includes(action);
}

type CalendarParts = { year: number; month: number; day: number; hour: number; minute: number; second: number };

function calendarParts(at: Date, timeZone: string): CalendarParts {
    const formatted = new Intl.DateTimeFormat("en-US", {
        timeZone,
        hourCycle: "h23",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).formatToParts(at);
    const pick = (type: string) => Number(formatted.find((part) => part.type === type)?.value);
    return {
        year: pick("year"),
        month: pick("month"),
        day: pick("day"),
        hour: pick("hour") % 24,
        minute: pick("minute"),
        second: pick("second"),
    };
}

function zoneOffsetMs(at: Date, timeZone: string) {
    const parts = calendarParts(at, timeZone);
    const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    return asUtc - at.getTime();
}

export function zonedDateTime(year: number, month: number, day: number, hour = 0, minute = 0, second = 0, millisecond = 0) {
    const guess = new Date(Date.UTC(year, month - 1, day, hour, minute, second, millisecond));
    const offset = zoneOffsetMs(guess, PUBLIC_SURFACE_TIME_ZONE);
    const instant = new Date(guess.getTime() - offset);
    const correction = zoneOffsetMs(instant, PUBLIC_SURFACE_TIME_ZONE) - offset;
    return correction === 0 ? instant : new Date(instant.getTime() - correction);
}

export function pad2(value: number) {
    return String(value).padStart(2, "0");
}

export function saoPauloCalendar(at: Date) {
    const parts = calendarParts(at, PUBLIC_SURFACE_TIME_ZONE);
    const day = `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`;
    return { day, month: day.slice(0, 7) };
}

export function monthWindow(month: string, activatedAt: Date | null = PUBLIC_SURFACE_ACTIVATED_AT) {
    const match = MONTH_KEY.exec(month);
    if (!match) return null;
    const year = Number(match[1]);
    const monthNumber = Number(match[2]);
    const start = zonedDateTime(year, monthNumber, 1);
    const nextYear = monthNumber === 12 ? year + 1 : year;
    const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1;
    const end = zonedDateTime(nextYear, nextMonth, 1);
    const activatedInside = activatedAt !== null && activatedAt >= start && activatedAt < end;
    const historyFrom = activatedAt === null ? end : activatedAt > start ? activatedAt : start;
    return {
        month,
        start,
        end,
        dayFrom: `${year}-${pad2(monthNumber)}-01`,
        dayTo: `${nextYear}-${pad2(nextMonth)}-01`,
        historyFrom,
        historyTo: end,
        dataSince: activatedInside && activatedAt > start ? saoPauloCalendar(activatedAt).day : null,
    };
}

export function formRate(proposalsCreated: number, formOpens: number): number | null {
    if (formOpens === 0) return null;
    return proposalsCreated / formOpens;
}

export const DAILY_INCREMENT_SQL = `
INSERT INTO public_surface_daily (id, venueId, day, subject, opens, clicks)
VALUES (?, ?, ?, ?, ?, ?)
ON DUPLICATE KEY UPDATE
    opens = opens + ?,
    clicks = clicks + ?
`.trim();

export const VISITOR_INSERT_SQL = `
INSERT INTO public_surface_visitor (id, venueId, month, surface, visitorKey)
VALUES (?, ?, ?, ?, ?)
ON DUPLICATE KEY UPDATE id = id
`.trim();
