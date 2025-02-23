import { z } from "zod";

export const getVenueAnalysisByMonthSchema = z.object({
    year: z.string(),
    venueId: z.string(),
    approved: z.string().optional(),
});

export type GetVenueAnalysisByMonthSchema = z.infer<typeof getVenueAnalysisByMonthSchema>;