import { Request, Response } from 'express';
import { GetVenueAnalyticsUseCase } from './use-case-get-venue-analytics';
import { getVenueAnalyticsParamsSchema } from '../../../zod/venue/get-venue-analytics-params-schema';

export class GetVenueAnalyticsController {
  constructor(private readonly getVenueAnalyticsUseCase: GetVenueAnalyticsUseCase) {}

  async handle(request: Request, response: Response) {
    try {
      const { venueId } = getVenueAnalyticsParamsSchema.parse(request.params);

      const analytics = await this.getVenueAnalyticsUseCase.execute({ venueId });

      return response.json(analytics);
    } catch (error) {
      if (error instanceof Error) {
        return response.status(400).json({ error: error.message });
      }
      return response.status(500).json({ error: 'Internal server error' });
    }
  }
} 