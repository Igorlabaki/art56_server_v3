import { z } from "zod";

export const getByIdProposalSchema = z.object({
    proposalId: z.string(),
});

export type GetByIdProposalSchema = z.infer<typeof getByIdProposalSchema>;