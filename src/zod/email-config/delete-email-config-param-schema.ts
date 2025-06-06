import { z } from 'zod'

export const deleteEmailConfigParamSchema = z.object({
  id: z.string()
}) 