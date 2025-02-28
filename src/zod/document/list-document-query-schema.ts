import { z } from "zod";

export const listDocumentRequestQuerySchema = z.object({
    proposalId: z.string(),
    document: z.string().optional(),
})

export type ListDocumentRequestQuerySchema = z.infer<typeof listDocumentRequestQuerySchema>;

