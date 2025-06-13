import { z } from "zod";

export const getSelectedVenueRequestParamSchema = z.object({
    venueId: z.string(),
    userId: z.string().optional(),
})

export type GetSelectedVenueRequestParamSchema = z.infer<typeof getSelectedVenueRequestParamSchema>;

