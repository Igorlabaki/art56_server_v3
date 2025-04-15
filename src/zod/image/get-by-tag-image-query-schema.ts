import { z } from "zod";

export const getByTagImageRequestQuerySchema = z.object({
    venueId: z.string(),
    tag: z.string().optional(),
    responsiveMode: z.string().optional(),
})

export type GetByTagImageRequestQuerySchema = z.infer<typeof getByTagImageRequestQuerySchema>;

