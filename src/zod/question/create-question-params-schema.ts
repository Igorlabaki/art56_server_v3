import { z } from "zod";

export const createQuestionSchema = z.object({
    venueId: z.string(),
    question: z.string(),
    response: z.string(),
});

export type CreateQuestionRequestParams = z.infer<typeof createQuestionSchema>;