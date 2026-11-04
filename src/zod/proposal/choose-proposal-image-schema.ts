import { z } from "zod";

export const chooseProposalImageSchema = z.object({
    slotId: z.string().min(1),
    replacementId: z.string().min(1),
});

export type ChooseProposalImageSchema = z.infer<typeof chooseProposalImageSchema>;
