import { z } from "zod";

export const updateGoalSchema = z.object({
    venueId: z.string(),
    goalId: z.string(),
    data: z.object({
        minValue: z.number(),
        months: z.string(),
        maxValue: z.number().optional(),
        increasePercent: z.number(),
    }),
});

export type UpdateGoalRequestParams = z.infer<typeof updateGoalSchema>;