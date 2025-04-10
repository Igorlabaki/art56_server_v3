import { z } from "zod";

export const deleteGoalRequestParamSchema = z.object({
    goalId: z.string(),
})

export type DeleteGoalRequestParamSchema = z.infer<typeof deleteGoalRequestParamSchema>;

