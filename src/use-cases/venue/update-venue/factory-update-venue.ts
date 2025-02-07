import prismaClient from "../../../service/prisma-client";
import { UpdateVenueUseCase } from "./use-case-update-venue";
import { UpdateVenueController } from "./controller-update-venue";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";

export const updateVenueFactory = () => {
  const prismaVenueRepository = new PrismaVenueRepository(prismaClient);
  const updateVenueCase = new UpdateVenueUseCase(prismaVenueRepository);
  const updateVenueController = new UpdateVenueController(updateVenueCase);

  return updateVenueController;
};
