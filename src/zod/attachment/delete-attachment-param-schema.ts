import { z } from "zod";

export const deleteAttachmentRequestParamSchema = z.object({
    attachmentId: z.string(),
})

export type DeleteAttachmentRequestParamSchema = z.infer<typeof deleteAttachmentRequestParamSchema>;

