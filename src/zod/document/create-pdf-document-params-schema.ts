import { z } from "zod";

export const createPdfDocumentRequestParams = z.object({
    title: z.string(),
    proposalId: z.string(),
    pdfUrl: z.string().optional(),
});

export type CreatePdfDocumentRequestParams = z.infer<typeof createPdfDocumentRequestParams>;