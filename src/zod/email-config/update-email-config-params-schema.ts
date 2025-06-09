import { z } from 'zod'

export const updateEmailConfigParamsSchema = z.object({
  emailConfigId: z.string(),
  backgroundImageUrl: z.string().optional(),
  title: z.string().optional(),
  type: z.string().optional(),
  message: z.string().optional(),
  venueId: z.string()
}) 


export type UpdateEmailConfigParamsSchema = z.infer<typeof updateEmailConfigParamsSchema>;