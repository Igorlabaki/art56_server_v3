import { VenueRepositoryInterface } from '../../../repositories/interface/venue-repository-interface';
import { GetVenueAnalyticsParams } from '../../../zod/venue/get-venue-analytics-params-schema';

export class GetVenueAnalyticsUseCase {
  constructor(private readonly venueRepository: VenueRepositoryInterface) {}

  async execute(params: GetVenueAnalyticsParams) {
    const analytics = await this.venueRepository.getVenueAnalytics(params);
    
    if (!analytics) {
      throw new Error('Venue not found');
    }

    const formatedResponse = {
        success: true,
        message: `Sucesso`,
        data: {
            ...analytics
        },
        count: 1,
        type: "Traffic Data"
    }

    return formatedResponse;
  }
} 