import { z } from "zod";

export const replaceProposalIndicationsBodySchema = z.object({
    contactIds: z.array(z.string().min(1)),
});

export type ReplaceProposalIndicationsBody = z.infer<typeof replaceProposalIndicationsBodySchema>;
