import { z } from "zod";

export const getVenuePresentationParamSchema = z.object({
    venueId: z.string().min(1),
});
