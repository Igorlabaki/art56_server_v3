import { z } from "zod";

export const getByTypeRequestQuerySchema = z.object({
    venueId: z.string(),
    type: z.string(),
})

export type GetByTypeRequestQuerySchema = z.infer<typeof getByTypeRequestQuerySchema>;

