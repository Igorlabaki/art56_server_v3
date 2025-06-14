import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import prismaClient from "../../../services/prisma-client";
import { GetWebDataController } from "./controller-get-web-data";
import { GetWebDataUseCase } from "./use-case-get-web-data";


export const getWebDataFactory = () => {
  const prismaVenueRepository = new PrismaVenueRepository(prismaClient);
  const getWebDataCase = new GetWebDataUseCase(prismaVenueRepository);
  const getWebDataController = new GetWebDataController(getWebDataCase);

  return getWebDataController;
};
