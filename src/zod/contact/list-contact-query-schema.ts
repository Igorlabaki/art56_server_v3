import { z } from "zod";

export const listContactRequestQuerySchema = z.object({
    venueId: z.string(),
    name: z.string().optional()
})

export type ListContactRequestQuerySchema = z.infer<typeof listContactRequestQuerySchema>;

