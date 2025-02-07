import { z } from "zod";

export const createScheduleSchema = z.object({
    name: z.string(),
    endHour: z.string(),
    startHour: z.string(),
    proposalId: z.string(),
    workerNumber: z.number(),
    description: z.string().optional(),
});

export type CreateScheduleRequestParams = z.infer<typeof createScheduleSchema>;