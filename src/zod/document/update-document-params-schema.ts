import { z } from "zod";

export const updateDocumentSchema = z.object({
    documentId: z.string(),
    title: z.string(),
    imageUrl: z.string().optional(),
});

export type UpdateDocumentRequestParams = z.infer<typeof updateDocumentSchema>;