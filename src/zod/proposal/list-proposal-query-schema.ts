import { z } from "zod";

export const listProposalRequestQuerySchema = z.object({
    venueId:z.string(),
    name: z.string().optional(),
    email: z.string().optional(),
    month: z.string().optional(),
    year: z.string().optional(),
    approved:z.string().transform((val) => val === "true").optional(),
})

export type ListProposalRequestQuerySchema = z.infer<typeof listProposalRequestQuerySchema>;

