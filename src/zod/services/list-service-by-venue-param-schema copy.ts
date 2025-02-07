import { z } from "zod";

export const listServiceByVenueRequestParamSchema = z.object({
    venueId: z.string(),
})

export type ListServiceByVenueRequestParamSchema = z.infer<typeof listServiceByVenueRequestParamSchema>;

