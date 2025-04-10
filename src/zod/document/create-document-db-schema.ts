import { z } from "zod";

export const createDocumentDbSchema = z.object({
    title: z.string(),
    imageUrl: z.string(),
    proposalId: z.string(),
    paymentId: z.string().optional(),
    fileType: z.enum(["IMAGE","PDF"]),
    thumbnailUrl: z.string().optional(),
});

export type CreateDocumentDbSchema = z.infer<typeof createDocumentDbSchema>;