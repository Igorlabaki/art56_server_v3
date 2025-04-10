import { z } from "zod";

export const verifyGoalSchema = z.object({
    venueId: z.string(),
    minValue: z.number(),
});

export type VerifyGoalRequestParams = z.infer<typeof verifyGoalSchema>;