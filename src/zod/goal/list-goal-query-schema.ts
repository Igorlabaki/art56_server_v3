import { z } from "zod";

export const listGoalRequestQuerySchema = z.object({
    venueId: z.string(),
    minValue: z.number().optional(),
})

export type ListGoalRequestQuerySchema = z.infer<typeof listGoalRequestQuerySchema>;

