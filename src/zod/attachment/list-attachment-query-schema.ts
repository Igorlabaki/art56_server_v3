import { z } from "zod";

export const listAttachmentRequestQuerySchema = z.object({
    organizationId: z.string(),
    name: z.string().optional(),
})

export type ListAttachmentRequestQuerySchema = z.infer<typeof listAttachmentRequestQuerySchema>;

