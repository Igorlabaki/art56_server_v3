import { z } from "zod";

export const updateSameDayDateEventSchema = z.object({
    userId: z.string(),
    venueId: z.string(),
    username: z.string(),
    proposalId:z.string(),
    dateEventId: z.string(),
    data: z.object({
      title: z.string(),
      endHour: z.string(),
      startHour: z.string(),
      date: z.string(),
      type: z.enum(["PRODUCTION", "BARTER", "OTHER", "EVENT", "OVERNIGHT","VISIT"]),
    })
});

export type UpdateSameDayDateEventSchema = z.infer<typeof updateSameDayDateEventSchema>;