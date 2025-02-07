import { z } from "zod";

export const deleteExpenseRequestParamSchema = z.object({
    expenseId: z.string(),
})

export type DeleteExpenseRequestParamSchema = z.infer<typeof deleteExpenseRequestParamSchema>;

