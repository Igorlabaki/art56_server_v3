import { z } from 'zod';

export const getVenueAnalyticsParamsSchema = z.object({
  venueId: z.string()
});

export type GetVenueAnalyticsParams = z.infer<typeof getVenueAnalyticsParamsSchema>; 