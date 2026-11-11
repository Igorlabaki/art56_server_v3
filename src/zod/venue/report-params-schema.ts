import { z } from "zod";
import { EVENT_CATEGORIES } from "../../functions/event-category";

export const REPORT_EVENT_CATEGORY_FILTERS = [...EVENT_CATEGORIES, "NONE"] as const;

export type ReportEventCategoryFilter = typeof REPORT_EVENT_CATEGORY_FILTERS[number];

export const reportParamsSchema = z.object({
    venueId: z.string().trim().min(1),
    year: z.coerce.number().int().min(2000).max(2100),
    month: z.coerce.number().int().min(1).max(12).optional(),
    eventCategory: z.enum(REPORT_EVENT_CATEGORY_FILTERS).optional(),
});

export type ReportParams = z.infer<typeof reportParamsSchema>;
