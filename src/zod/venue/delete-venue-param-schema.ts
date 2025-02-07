import { z } from "zod";

export const deleteVenueRequestParamSchema = z.object({
    venueId: z.string(),
})

export type DeleteVenueRequestParamSchema = z.infer<typeof deleteVenueRequestParamSchema>;

