import { z } from "zod";

export const listGoalRequestQuerySchema = z.object({
    venueId: z.string(),
    minValue: z.string().optional(),
})

export type ListGoalRequestQuerySchema = z.infer<typeof listGoalRequestQuerySchema>;

