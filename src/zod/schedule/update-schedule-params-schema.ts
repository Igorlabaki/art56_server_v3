import { z } from "zod";

export const updateScheduleSchema = z.object({
    scheduleId: z.string(),
    data: z.object({
        name: z.string(),
        endHour: z.string(),
        startHour: z.string(),
        workerNumber: z.number(),
        description: z.string().optional(),
    }),
});

export type UpdateScheduleRequestParams = z.infer<typeof updateScheduleSchema>;