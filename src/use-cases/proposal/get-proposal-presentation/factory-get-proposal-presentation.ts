import prismaClient from "../../../services/prisma-client";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";
import { PrismaVenueSiteEditPermission } from "../../../repositories/in-prisma/venue-site-edit-permission-in-prisma";
import { GetProposalPresentationUseCase } from "./use-case-get-proposal-presentation";
import { GetProposalPresentationController } from "./controller-get-proposal-presentation";

export const getProposalPresentationFactory = () => {
    const repository = new PrismaProposalRepository(prismaClient);
    const permission = new PrismaVenueSiteEditPermission(prismaClient);
    const useCase = new GetProposalPresentationUseCase(repository, permission);
    return new GetProposalPresentationController(useCase);
};
