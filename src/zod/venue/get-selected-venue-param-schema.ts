import { z } from "zod";

export const getSelectedVenueRequestParamSchema = z.object({
    userId: z.string(),
    venueId: z.string(),
})

export type GetSelectedVenueRequestParamSchema = z.infer<typeof getSelectedVenueRequestParamSchema>;

