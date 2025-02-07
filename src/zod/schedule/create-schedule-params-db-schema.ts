import { z } from "zod";

export const createScheduleDbSchema = z.object({
    name: z.string(),
    endHour: z.date(),
    startHour: z.date(),
    proposalId: z.string(),
    workerNumber: z.number(),
    description: z.string().optional(),
});

export type CreateScheduleDbParams = z.infer<typeof createScheduleDbSchema>;