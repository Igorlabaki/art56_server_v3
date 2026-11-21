import prismaClient from "../../../services/prisma-client";
import { UpdateVenueUseCase } from "./use-case-update-venue";
import { UpdateVenueController } from "./controller-update-venue";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { PrismaVenueLinkRepository } from "../../../repositories/in-prisma/venue-link-in-prisma-repository";

export const updateVenueFactory = () => {
  const prismaVenueRepository = new PrismaVenueRepository(prismaClient);
  const links = new PrismaVenueLinkRepository(prismaClient);
  const updateVenueCase = new UpdateVenueUseCase(prismaVenueRepository, links);
  const updateVenueController = new UpdateVenueController(updateVenueCase, prismaVenueRepository);

  return updateVenueController;
};
