import { z } from "zod";

export const updateAttachmentSchema = z.object({
    attachmentId: z.string(),
    data: z.object({
        title:  z.string(),
        text:  z.string(),
        venueId:  z.string(),
    }),
});

export type UpdateAttachmentRequestParams = z.infer<typeof updateAttachmentSchema>;