import { z } from "zod";

export const updateDateEventDbSchema = z.object({
    dateEventId: z.string(),
    data: z.object({
      title: z.string().optional(),
      endDate: z.date().optional(),
      endHour: z.string().optional(),
      startDate: z.date().optional(),
      startHour: z.string().optional(),
      type: z.enum(["PRODUCTION", "BARTER", "OTHER", "EVENT", "OVERNIGHT","VISIT"]).optional(),
    })
});

export type UpdateDateEventDbSchema = z.infer<typeof updateDateEventDbSchema>;