import { z } from 'zod'

export const createEmailConfigParamsSchema = z.object({
  backgroundImageUrl: z.string().optional(),
  title: z.string().optional(),
  type: z.string(),
  message: z.string().optional(),
  venueId: z.string()
}) 


export type CreateEmailConfigParamsSchema = z.infer<typeof createEmailConfigParamsSchema>;

