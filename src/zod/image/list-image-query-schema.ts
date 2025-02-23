import { z } from "zod";

export const listImageRequestQuerySchema = z.object({
    venueId: z.string(),
    description: z.string().optional()
})

export type ListImageRequestQuerySchema = z.infer<typeof listImageRequestQuerySchema>;

