import { z } from "zod";

export const createDocumentDbSchema = z.object({
    title: z.string(),
    imageUrl: z.string(),
    proposalId: z.string(),
});

export type CreateDocumentDbSchema = z.infer<typeof createDocumentDbSchema>;