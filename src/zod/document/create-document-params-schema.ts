import { z } from "zod";

export const createDocumentSchema = z.object({
    title: z.string(),
    proposalId: z.string(),
    pdfUrl: z.string().optional(),
    imageUrl: z.string().optional(),
    thumbnailUrl:z.string().optional()
});

export type CreateDocumentRequestParams = z.infer<typeof createDocumentSchema>;