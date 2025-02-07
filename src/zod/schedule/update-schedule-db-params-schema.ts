import { z } from "zod";

export const updateScheduleDbSchemaParams = z.object({
    scheduleId: z.string(),
    data: z.object({
        name: z.string(),
        endHour: z.date(),
        startHour: z.date(),
        workerNumber: z.number(),
        description: z.string().optional(),
    }),
});

export type UpdateScheduleDbSchemaParams = z.infer<typeof updateScheduleDbSchemaParams>;