import { z } from "zod";
import { ADS_CHANNELS } from "../../functions/expense-recurrence";

export const updateExpenseSchema = z.object({
    expenseId: z.string(),
    data: z.object({
        name: z.string().optional(),
        amount: z.number().optional(),
        recurring: z.boolean().optional(),
        paymentDate: z.string().optional(),
        description: z.string().optional(),
        type: z.enum(["ANNUAL", "MONTHLY","WEEKLY","BIWEEKLY","SPORADIC"]).optional(),
        category:  z.enum(["TAX", "ADVERTISING","MAINTENANCE","INVESTMENT"]).optional(),
        trafficSource: z.enum(ADS_CHANNELS).nullable().optional(),
    }),
});

export type UpdateExpenseRequestParams = z.infer<typeof updateExpenseSchema>;