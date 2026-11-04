import prismaClient from "../../../services/prisma-client";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";
import { PrismaVenueSiteEditPermission } from "../../../repositories/in-prisma/venue-site-edit-permission-in-prisma";
import { ReorderProposalImagesUseCase } from "./use-case-reorder-proposal-images";
import { ReorderProposalImagesController } from "./controller-reorder-proposal-images";

export const reorderProposalImagesFactory = () => {
    const repository = new PrismaProposalRepository(prismaClient);
    const permission = new PrismaVenueSiteEditPermission(prismaClient);
    const useCase = new ReorderProposalImagesUseCase(repository, permission);
    return new ReorderProposalImagesController(useCase);
};
