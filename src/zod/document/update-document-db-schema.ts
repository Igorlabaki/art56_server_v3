import { z } from "zod";

export const updateDocumentDbSchema = z.object({
    documentId: z.string(),
    data: z.object({
        title:  z.string(),
        imageUrl:  z.string(),
    }),
});

export type UpdateDocumentDbSchema = z.infer<typeof updateDocumentDbSchema>;