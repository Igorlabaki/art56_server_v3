import { z } from "zod";

export const listQuestionRequestQuerySchema = z.object({
    venueId: z.string(),
    question: z.string().optional(),
})

export type ListQuestionRequestQuerySchema = z.infer<typeof listQuestionRequestQuerySchema>;

