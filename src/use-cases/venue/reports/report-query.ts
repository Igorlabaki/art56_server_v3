import { EventCategory } from "../../../functions/event-category";
import { yearStart } from "../../../functions/monthly-average-by-years";
import { reportYearRange } from "../../../functions/report-year-range";
import { ReportProposalWhere } from "../../../repositories/interface/proposal-repository-interface";
import { ReportEventCategoryFilter } from "../../../zod/venue/report-params-schema";

const DAY_MS = 24 * 60 * 60 * 1000;

export function reportEnvelope<T>(data: T, type: string) {
    return { success: true, message: "Sucesso", data, count: 1, type };
}

/** `NONE` filtra quem nao tem categoria; ausente nao filtra. */
export function reportCategoryWhere(filter: ReportEventCategoryFilter | undefined): { eventCategory?: EventCategory | null } {
    if (!filter) return {};
    return { eventCategory: filter === "NONE" ? null : filter };
}

/** Folga de um dia em cada ponta: o ano local de `createdAt` e filtrado depois, em memoria. */
export function leadTimeWhere(venueId: string, year: number, filter?: ReportEventCategoryFilter): ReportProposalWhere {
    return {
        venueId,
        createdAt: {
            gte: new Date(yearStart(year).getTime() - DAY_MS),
            lt: new Date(yearStart(year + 1).getTime() + DAY_MS),
        },
        ...reportCategoryWhere(filter),
    };
}

/** Mesma populacao de `analysisByMonth` com aprovadas: `approved` e `startDate` no ano. */
export function approvedInYearWhere(venueId: string, year: number, filter?: ReportEventCategoryFilter): ReportProposalWhere {
    return {
        venueId,
        approved: true,
        startDate: reportYearRange(year),
        ...reportCategoryWhere(filter),
    };
}
