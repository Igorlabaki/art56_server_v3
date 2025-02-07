import { z } from "zod";

export const getbyidScheduleRequestParamSchema = z.object({
    scheduleId: z.string(),
})

export type GetByIdScheduleRequestParamSchema = z.infer<typeof getbyidScheduleRequestParamSchema>;

