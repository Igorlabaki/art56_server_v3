import { z } from "zod";

export const createDocumentSchema = z.object({
    title: z.string(),
    proposalId: z.string(),
    imageUrl: z.string().optional(),
});

export type CreateDocumentRequestParams = z.infer<typeof createDocumentSchema>;