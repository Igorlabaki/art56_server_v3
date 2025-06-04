import { z } from "zod";

export const createQuestionSchema = z.object({
    venueId: z.string(),
    question: z.string(),
    response: z.string(),
});
/* d */
export type CreateQuestionRequestParams = z.infer<typeof createQuestionSchema>;