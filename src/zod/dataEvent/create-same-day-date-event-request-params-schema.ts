import { z } from 'zod';

export const createSameDayDateEventRequestParmsSchema = z
  .object({
    userId: z.string(),
    venueId: z.string(),
    username: z.string(),
    proposalId: z.string().optional(),
    data: z.object({
      title: z.string(),
      endHour: z.string(),
      startHour: z.string(),
      date: z.string(),
      type: z.enum(["PRODUCTION", "BARTER", "OTHER", "EVENT", "OVERNIGHT","VISIT"]),
    })
  })

export type CreateSameDayDateEventRequestParmsSchema = z.infer<typeof createSameDayDateEventRequestParmsSchema>;
