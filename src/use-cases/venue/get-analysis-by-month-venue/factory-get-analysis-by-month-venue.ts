import prismaClient from "../../../services/prisma-client";
import { GetVenueAnalysisByMonthUseCase } from "./use-case-get-analysis-by-month-venue";
import { GetVenueAnalysiByMonthController } from "./controller-get-analysis-by-month-venue";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";

export const getVenueAnalysiByMonthFactory = () => {
  const prismaVenueRepository = new PrismaVenueRepository(prismaClient);
  const prismaProposalRepository = new PrismaProposalRepository(prismaClient);
  const getvenueAnalysiByMonthCase = new GetVenueAnalysisByMonthUseCase(prismaVenueRepository,prismaProposalRepository);
  const getvenueAnalysiByMonthController = new GetVenueAnalysiByMonthController(getvenueAnalysiByMonthCase);

  return getvenueAnalysiByMonthController;
};
