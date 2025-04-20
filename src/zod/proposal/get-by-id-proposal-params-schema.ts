import { z } from "zod";

export const getByIdProposalSchema = z.object({
    proposalId: z.string(),
    personTypeList: z.enum(["WORKER","GUEST"]).optional(),
});

export type GetByIdProposalSchema = z.infer<typeof getByIdProposalSchema>;