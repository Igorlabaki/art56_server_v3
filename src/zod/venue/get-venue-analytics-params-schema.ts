import { z } from 'zod';

export const GetVenueAnalyticsParamsSchema = z.object({
  venueId: z.string(),
  params: z.object({
    month: z.enum(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'all']).optional(),
    year: z.string().optional()
  }).optional()
});

export type GetVenueAnalyticsParams = z.infer<typeof GetVenueAnalyticsParamsSchema>; 