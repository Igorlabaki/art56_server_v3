
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { UpdateVenueInfoController } from "./controller-update-info-venue";
import { UpdateInfoVenueUseCase } from "./use-case-update-info-venue";
import { PrismaClient } from "@prisma/client";

export const updateVenueInfoFactory = () => {
  const prismaVenueRepository = new PrismaVenueRepository(new PrismaClient());
  const updateVenueInfoUseCase = new UpdateInfoVenueUseCase(prismaVenueRepository);
  const updateVenueInfoController = new UpdateVenueInfoController(updateVenueInfoUseCase, prismaVenueRepository);

  return updateVenueInfoController;
};
