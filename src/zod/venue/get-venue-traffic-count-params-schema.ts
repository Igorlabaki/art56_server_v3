import { z } from "zod";

export const getTrafficCountVenueSchema = z.object({
    year: z.string(),
    venueId: z.string(),
    approved: z.string().optional(),
});

export type GetTrafficCountVenueSchema = z.infer<typeof getTrafficCountVenueSchema>;