import { z } from "zod";

export const createGoalSchema = z.object({
    months: z.array(z.string()).optional().default([]),
    venueId: z.string(),
    minValue: z.string(),
    maxValue: z.string(),
    increasePercent: z.string(),
});

export type CreateGoalRequestParams = z.infer<typeof createGoalSchema>;