import { z } from 'zod'

export const createEmailConfigParamsSchema = z.object({
  backgroundImageUrl: z.string().optional(),
  title: z.string().optional(),
  type: z.enum(['PROPOSAL', 'CONTRACT']),
  message: z.string().optional(),
  venueId: z.string()
}) 