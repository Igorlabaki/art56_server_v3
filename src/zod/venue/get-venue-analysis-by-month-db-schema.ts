import { z } from "zod";

export const getVenueAnalysisByMonthDbSchema = z.object({
    year: z.number(),
    venueId: z.string(),
    approved: z.boolean().optional(),
});

export type GetVenueAnalysisByMonthDbSchema = z.infer<typeof getVenueAnalysisByMonthDbSchema>;