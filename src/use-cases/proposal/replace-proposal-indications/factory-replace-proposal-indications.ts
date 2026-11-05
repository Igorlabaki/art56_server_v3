import prismaClient from "../../../services/prisma-client";
import { PrismaProposalIndicationRepository } from "../../../repositories/in-prisma/proposal-indication-in-prisma-repository";
import { PrismaUserVenuePermissionRepository } from "../../../repositories/in-prisma/user-venue-permission-in-prisma-repository";
import { ReplaceProposalIndicationsController } from "./controller-replace-proposal-indications";
import { ReplaceProposalIndicationsUseCase } from "./use-case-replace-proposal-indications";

export const replaceProposalIndicationsFactory = () => {
    const useCase = new ReplaceProposalIndicationsUseCase(
        new PrismaProposalIndicationRepository(prismaClient),
        new PrismaUserVenuePermissionRepository(prismaClient),
    );
    return new ReplaceProposalIndicationsController(useCase);
};
