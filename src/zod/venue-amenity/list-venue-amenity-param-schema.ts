import { z } from "zod";

export const listVenueAmenityParamSchema = z.object({
    venueId: z.string().min(1),
});
