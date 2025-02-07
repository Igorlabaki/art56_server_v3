import { z } from "zod";

export const deleteByIdProposalSchema = z.object({
    proposalId: z.string(),
});

export type DeleteByIdProposalSchema = z.infer<typeof deleteByIdProposalSchema>;