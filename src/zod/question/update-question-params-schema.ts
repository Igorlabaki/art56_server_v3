import { z } from "zod";

export const updateQuestionSchema = z.object({
    venueId: z.string(),
    questionId: z.string(),
    data: z.object({
        question:  z.string(),
        response:  z.string(),
    }),
});

export type UpdateQuestionRequestParams = z.infer<typeof updateQuestionSchema>;