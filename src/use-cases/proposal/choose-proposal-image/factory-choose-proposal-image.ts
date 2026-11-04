import prismaClient from "../../../services/prisma-client";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";
import { PrismaVenueSiteEditPermission } from "../../../repositories/in-prisma/venue-site-edit-permission-in-prisma";
import { ChooseProposalImageUseCase } from "./use-case-choose-proposal-image";
import { ChooseProposalImageController } from "./controller-choose-proposal-image";

export const chooseProposalImageFactory = () => {
    const repository = new PrismaProposalRepository(prismaClient);
    const permission = new PrismaVenueSiteEditPermission(prismaClient);
    const useCase = new ChooseProposalImageUseCase(repository, permission);
    return new ChooseProposalImageController(useCase);
};
