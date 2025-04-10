import { z } from "zod";

export const createGoalSchema = z.object({
    months: z.string(),
    venueId: z.string(),
    minValue: z.string(),
    maxValue: z.string(),
    increasePercent: z.string(),
});

export type CreateGoalRequestParams = z.infer<typeof createGoalSchema>;