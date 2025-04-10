import { z } from "zod";

export const createGoalDbSchema = z.object({
    venueId: z.string(),
    minValue: z.number(),
    maxValue: z.number(),
    months: z.string(),
    increasePercent: z.number(),
});

export type CreateGoalDbRequestParams = z.infer<typeof createGoalDbSchema>;