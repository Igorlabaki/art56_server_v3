import { z } from "zod";

export const getTrafficCountVenueDbSchema = z.object({
    year: z.number(),
    venueId: z.string(),
    approved: z.boolean(),
});

export type GetTrafficCountVenueDbSchema = z.infer<typeof getTrafficCountVenueDbSchema>;