import { z } from "zod";

export const updateQuestionSchema = z.object({
    questionId: z.string(),
    data: z.object({
        question:  z.string().optional(),
        response:  z.string().optional(),
    }),
});

export type UpdateQuestionRequestParams = z.infer<typeof updateQuestionSchema>;