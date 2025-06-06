import { z } from 'zod'

export const deleteEmailConfigParamSchema = z.object({
  emailConfigId: z.string()
}) 