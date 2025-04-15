import { z } from "zod";

export const listImageRequestQuerySchema = z.object({
    venueId: z.string(),
    responsiveMode: z.string().optional(),
    description: z.string().optional(),
})

export type ListImageRequestQuerySchema = z.infer<typeof listImageRequestQuerySchema>;

