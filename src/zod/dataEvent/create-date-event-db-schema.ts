import { z } from 'zod';

export const createDateEventDbSchema = z
  .object({
    userId: z.string(),
    venueId: z.string(),
    username: z.string(),
    proposalId: z.string().optional(),
    data: z.object({
      title: z.string(),
      startDate: z.date(),
      endDate: z.date(),
      type: z.enum(["PRODUCTION", "BARTER", "OTHER", "EVENT","OVERNIGHT","VISIT"]),
    })
  })

export type CreateDateEventDbSchema = z.infer<typeof createDateEventDbSchema>;
