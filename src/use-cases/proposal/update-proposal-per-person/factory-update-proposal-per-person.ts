import prismaClient from "../../../service/prisma-client";
import { UpdateProposalPerPersonUseCase } from "./use-case-update-proposal-per-person";
import { UpdateProposalPerPersonController } from "./controller-update-proposal-per-person";
import { PrismaUserRepository } from "../../../repositories/in-prisma/user-in-prisma-repository";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { PrismaServiceRepository } from "../../../repositories/in-prisma/service-in-prisma-repository";
import { PrismaHistoryRepository } from "../../../repositories/in-prisma/history-in-prisma-repository";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";

export const updateProposalPerPersonFactory = () => {
  const prismaUserRepository = new PrismaUserRepository(prismaClient);
  const prismaVenueRepository = new PrismaVenueRepository(prismaClient);
  const prismaServiceRepository = new PrismaServiceRepository(prismaClient);
  const prismaHistoryRepository = new PrismaHistoryRepository(prismaClient);
  const prismaProposalRepository = new PrismaProposalRepository(prismaClient);
  const updateProposalUseCase = new UpdateProposalPerPersonUseCase(
    prismaUserRepository,
    prismaVenueRepository,
    prismaServiceRepository,
    prismaHistoryRepository,
    prismaProposalRepository,
  );
  const updateProposalPerPersonController = new UpdateProposalPerPersonController(updateProposalUseCase);

  return updateProposalPerPersonController;
};
