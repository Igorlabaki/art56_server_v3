import { z } from "zod";

export const listDocumentRequestQuerySchema = z.object({
    proposalId: z.string(),
    imageUrl: z.string().optional(),
})

export type ListDocumentRequestQuerySchema = z.infer<typeof listDocumentRequestQuerySchema>;

