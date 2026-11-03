import { z } from "zod";

export const listVenueRuleParamSchema = z.object({
    venueId: z.string().min(1),
});
