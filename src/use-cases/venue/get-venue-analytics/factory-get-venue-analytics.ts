import { PrismaClient } from '@prisma/client';
import { PrismaVenueRepository } from '../../../repositories/in-prisma/venue-in-prisma-repository';
import { GetVenueAnalyticsUseCase } from './use-case-get-venue-analytics';
import { GetVenueAnalyticsController } from './controller-get-venue-analytics';

export const makeGetVenueAnalyticsController = () => {
  const prisma = new PrismaClient();
  const venueRepository = new PrismaVenueRepository(prisma);
  const getVenueAnalyticsUseCase = new GetVenueAnalyticsUseCase(venueRepository);
  return new GetVenueAnalyticsController(getVenueAnalyticsUseCase);
}; 