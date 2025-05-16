import { Request, Response } from 'express';
import { GetVenueAnalyticsUseCase } from './use-case-get-venue-analytics';
import { GetVenueAnalyticsParamsSchema } from '../../../zod/venue/get-venue-analytics-params-schema';

export class GetVenueAnalyticsController {
  constructor(private readonly getVenueAnalyticsUseCase: GetVenueAnalyticsUseCase) {}

  async handle(request: Request, response: Response) {
    try {
      const { venueId } = request.params;
      const { month, year } = request.query;

      // Validar os parâmetros usando o schema
      const validatedParams = GetVenueAnalyticsParamsSchema.parse({
        venueId,
        params: {
          month: month as '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | 'all' | undefined,
          year: year as string | undefined
        }
      });

      const analytics = await this.getVenueAnalyticsUseCase.execute(validatedParams);

      return response.json(analytics);
    } catch (error) {
      if (error instanceof Error) {
        return response.status(400).json({ error: error.message });
      }
      return response.status(500).json({ error: 'Internal server error' });
    }
  }
} 