import prismaClient from "../../../services/prisma-client";

import { DeleteVenueController } from "./controller-delete-venue";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { DeleteVenueUseCase } from "./use-case-delete-venue";

export const deleteVenueFactory = () => {
  const prismaVenueRepository = new PrismaVenueRepository(prismaClient);
  const deleteVenueCase = new DeleteVenueUseCase(prismaVenueRepository);
  const deleteVenueController = new DeleteVenueController(deleteVenueCase);

  return deleteVenueController;
};
