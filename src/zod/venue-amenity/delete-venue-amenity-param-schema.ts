import { z } from "zod";

export const deleteVenueAmenityParamSchema = z.object({
    amenityId: z.string().min(1),
});
