import { z } from "zod";

export const deleteClauseRequestParamSchema = z.object({
    clauseId: z.string(),
})

export type DeleteClauseRequestParamSchema = z.infer<typeof deleteClauseRequestParamSchema>;

