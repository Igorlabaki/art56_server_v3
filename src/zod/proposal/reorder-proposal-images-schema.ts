import { z } from "zod";

export const reorderProposalImagesSchema = z.object({
    imageIds: z.array(z.string().min(1)),
});

export type ReorderProposalImagesSchema = z.infer<typeof reorderProposalImagesSchema>;
