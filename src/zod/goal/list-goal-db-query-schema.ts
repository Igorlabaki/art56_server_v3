import { z } from "zod";

export const listGoalDbRequestQuerySchema = z.object({
    venueId: z.string(),
    minValue: z.number().optional(),
})

export type ListGoalDbRequestQuerySchema = z.infer<typeof listGoalDbRequestQuerySchema>;

