import { z } from "zod";

export const updateClauseSchema = z.object({
    previoustitle: z.string(),
    clauseId: z.string(),
    data: z.object({
        text: z.string(),
        title: z.string(),
    }),
});

export type UpdateClauseRequestParams = z.infer<typeof updateClauseSchema>;