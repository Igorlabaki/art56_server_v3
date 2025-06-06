import { z } from 'zod'

export const listEmailConfigQuerySchema = z.object({
  venueId: z.string(),
  type: z.enum(['PROPOSAL', 'CONTRACT']).optional()
}) 