import prismaClient from "../../../service/prisma-client";
import { GetVenueTrafficCountUseCase } from "./use-case-get-traffic-count-venue";
import { GetVenueTrafficCountController } from "./controller-get-traffic-count-venue";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";

export const getVenueTrafficCountFactory = () => {
  const prismaVenueRepository = new PrismaVenueRepository(prismaClient);
  const prismaProposalRepository = new PrismaProposalRepository(prismaClient);
  const getvenueTrafficCountCase = new GetVenueTrafficCountUseCase(prismaVenueRepository,prismaProposalRepository);
  const getvenueTrafficCountController = new GetVenueTrafficCountController(getvenueTrafficCountCase);

  return getvenueTrafficCountController;
};
