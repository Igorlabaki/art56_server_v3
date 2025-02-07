import { z } from "zod";

export const deleteScheduleRequestParamSchema = z.object({
    scheduleId: z.string(),
})

export type DeleteScheduleRequestParamSchema = z.infer<typeof deleteScheduleRequestParamSchema>;

