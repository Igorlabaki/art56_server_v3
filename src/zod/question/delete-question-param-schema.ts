import { z } from "zod";

export const deleteQuestionRequestParamSchema = z.object({
    questionId: z.string(),
})

export type DeleteQuestionRequestParamSchema = z.infer<typeof deleteQuestionRequestParamSchema>;

