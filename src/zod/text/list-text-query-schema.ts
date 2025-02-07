import { z } from "zod";

export const listTextRequestQuerySchema = z.object({
    venueId: z.string(),
    area: z.string().optional(),
})

export type ListTextRequestQuerySchema = z.infer<typeof listTextRequestQuerySchema>;

