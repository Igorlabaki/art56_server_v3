import prismaClient from "../../../services/prisma-client";
import { PrismaNotificationRepository } from "../../../repositories/in-prisma/notification-in-prisma-repository";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";
import { PrismaUserVenuePermissionRepository } from "../../../repositories/in-prisma/user-venue-permission-in-prisma-repository";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { ReadNotificationsByProposalController } from "./controller-read-by-proposal";
import { ReadNotificationsByProposalUseCase } from "./use-case-read-by-proposal";

export const readNotificationsByProposalFactory = (): ReadNotificationsByProposalController => {
  const useCase = new ReadNotificationsByProposalUseCase(
    new PrismaNotificationRepository(prismaClient),
    new PrismaProposalRepository(prismaClient),
    new PrismaVenueRepository(prismaClient),
    new PrismaUserVenuePermissionRepository(prismaClient),
  );
  return new ReadNotificationsByProposalController(useCase);
};
