import { z } from "zod";

export const createGoalSchema = z.object({
    months: z.array(z.string()).optional().default([]),
    venueId: z.string(),
    minValue: z.string(),
    increasePercent: z.string(),
    maxValue: z.string().optional(),
});

export type CreateGoalRequestParams = z.infer<typeof createGoalSchema>;