import prismaClient from "../../../services/prisma-client";

import { PrismaOwnerRepository } from "../../../repositories/in-prisma/owner-in-prisma-repository";
import { PrismaOrganizationRepository } from "../../../repositories/in-prisma/organization-in-prisma-repository";
import { UpdateVenueOrganizationImageUseCase } from "./use-case-update-venue-organization-image";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { UpdateVenueOrganizationImageController } from "./controller-update-venue-organization-image";

export const updateVenueOrganizationImageFactory = () => {
  const prismaOrganizationRepository = new PrismaOrganizationRepository(prismaClient);
  const prismaVenueRepository = new PrismaVenueRepository(prismaClient);
  const updateVenueOrganizationImageUseCase = new UpdateVenueOrganizationImageUseCase(prismaOrganizationRepository, prismaVenueRepository);
  const updateVenueOrganizationImageController = new UpdateVenueOrganizationImageController(updateVenueOrganizationImageUseCase);

  return updateVenueOrganizationImageController;
};
