import { z } from "zod";

export const getVenueByIdRequestParamSchema = z.object({
    venueId: z.string(),
})

export type GetVenueByIdRequestParamSchema = z.infer<typeof getVenueByIdRequestParamSchema>;

