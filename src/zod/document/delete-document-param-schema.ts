import { z } from "zod";

export const deleteDocumentRequestParamSchema = z.object({
    documentId: z.string(),
})

export type DeleteDocumentRequestParamSchema = z.infer<typeof deleteDocumentRequestParamSchema>;

