import { z } from 'zod';

export const createOvernigthDateEventRequestParmsSchema = z
  .object({
    userId: z.string(),
    venueId: z.string(),
    username: z.string(),
    proposalId: z.string().optional(),
    data: z.object({
      title: z.string(),
      endDay: z.string(),
      endHour: z.string(),
      startDay: z.string(),
      startHour: z.string(),
      type: z.enum(["PRODUCTION", "BARTER", "OTHER", "EVENT", "OVERNIGHT","VISIT"]),
    })
  })

export type CreateOvernigthDateEventRequestParmsSchema = z.infer<typeof createOvernigthDateEventRequestParmsSchema>;
