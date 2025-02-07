import { z } from "zod";

export const listDateEventRequestQuerySchema = z.object({
    venueId:z.string().optional(),
    proposalId: z.string().optional(),
})

export type ListDateEventRequestQuerySchema = z.infer<typeof listDateEventRequestQuerySchema>;

