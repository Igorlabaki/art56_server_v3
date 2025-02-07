import prismaClient from "../../../service/prisma-client";

import { GetVenueByIdController } from "./controller-get-by-id-venue";
import { GetVenueByIdUseCase } from "./use-case-get-by-id-venue";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";

export const getVenuebyidFactory = () => {
  const prismaVenueRepository = new PrismaVenueRepository(prismaClient);
  const getvenuebyidCase = new GetVenueByIdUseCase(prismaVenueRepository);
  const getvenuebyidController = new GetVenueByIdController(getvenuebyidCase);

  return getvenuebyidController;
};
