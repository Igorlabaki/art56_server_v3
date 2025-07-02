
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import prismaClient from "../../../services/prisma-client";
import { GetHubDataController } from "./controller-get-web-data";
import { GetHubDataUseCase } from "./use-case-get-web-data";
import { PrismaOrganizationRepository } from "../../../repositories/in-prisma/organization-in-prisma-repository";
export const getHubDataFactory = () => {
  const prismaVenueRepository = new PrismaVenueRepository(prismaClient);
  const prismaOrganizationRepository = new PrismaOrganizationRepository(prismaClient);
  const getHubDataCase = new GetHubDataUseCase(prismaVenueRepository, prismaOrganizationRepository);
  const getHubDataController = new GetHubDataController(getHubDataCase);

  return getHubDataController;
};
