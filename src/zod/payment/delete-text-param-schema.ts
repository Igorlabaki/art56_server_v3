import { z } from "zod";

export const deleteTextRequestParamSchema = z.object({
    textId: z.string(),
})

export type DeleteTextRequestParamSchema = z.infer<typeof deleteTextRequestParamSchema>;

