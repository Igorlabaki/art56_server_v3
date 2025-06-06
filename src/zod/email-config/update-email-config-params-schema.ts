import { z } from 'zod'

export const updateEmailConfigParamsSchema = z.object({
  emailConfigId: z.string(),
  backgroundImageUrl: z.string().optional(),
  title: z.string().optional(),
  type: z.enum(['PROPOSAL', 'CONTRACT']).optional(),
  message: z.string().optional(),
  venueId: z.string()
}) 